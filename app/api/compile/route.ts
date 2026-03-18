import { NextRequest, NextResponse } from "next/server";
import { Worker } from "worker_threads";
import { COMPILE_WORKER_CODE } from "@/lib/compile-worker-code";
import { resolveAllImports } from "@/lib/import-resolver";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limiter";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY_SIZE = 102400; // 100KB
const WORKER_TIMEOUT_MS = 30_000;

interface CompileRequest {
  source: string;
  mode: "evm" | "pvm";
}

interface CompileResponse {
  success: boolean;
  contracts?: Record<string, { abi: any[]; bytecode: string }>;
  contractNames?: string[];
  errors?: Array<{ message: string; severity: string; formattedMessage?: string }>;
  warnings?: Array<{ message: string; formattedMessage?: string }>;
  resolvedVersions?: Record<string, string>;
}

function compileInWorker(
  input: string,
  mode: string,
  timeoutMs = WORKER_TIMEOUT_MS
): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(COMPILE_WORKER_CODE, {
      eval: true,
      workerData: { mode, input },
    });
    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error("Compilation timed out after 30s"));
    }, timeoutMs);

    worker.on("message", (msg) => {
      clearTimeout(timer);
      if (msg.success) {
        resolve(msg.output);
      } else {
        reject(new Error(msg.error || "Compilation failed"));
      }
    });
    worker.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    worker.on("exit", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

/**
 * Parse standard Solidity JSON output into our response format.
 * Works for both solc and resolc (same output structure).
 */
function parseCompilerOutput(
  output: any
): Omit<CompileResponse, "resolvedVersions"> {
  const errors: CompileResponse["errors"] = [];
  const warnings: CompileResponse["warnings"] = [];

  if (output.errors) {
    for (const err of output.errors) {
      if (err.severity === "warning") {
        warnings.push({
          message: err.message,
          formattedMessage: err.formattedMessage,
        });
      } else {
        errors.push({
          message: err.message,
          severity: err.severity || "error",
          formattedMessage: err.formattedMessage,
        });
      }
    }
  }

  if (!output.contracts || errors.length > 0) {
    return { success: false, errors, warnings };
  }

  const contracts: Record<string, { abi: any[]; bytecode: string }> = {};
  const contractNames: string[] = [];

  for (const [fileName, fileContracts] of Object.entries(
    output.contracts as Record<string, Record<string, any>>
  )) {
    for (const [contractName, contractData] of Object.entries(fileContracts)) {
      const bytecode = contractData?.evm?.bytecode?.object || "";
      const abi = contractData?.abi || [];

      // Only include contracts with bytecode (skip interfaces, abstract contracts)
      if (bytecode) {
        const key = `${fileName}:${contractName}`;
        contracts[key] = { abi, bytecode };
        contractNames.push(key);
      }
    }
  }

  // Sort: user's contracts (Contract.sol) first, imported dependencies last
  contractNames.sort((a, b) => {
    const aIsUser = a.startsWith("Contract.sol:");
    const bIsUser = b.startsWith("Contract.sol:");
    if (aIsUser && !bIsUser) return -1;
    if (!aIsUser && bIsUser) return 1;
    return 0;
  });

  if (contractNames.length === 0) {
    return {
      success: false,
      errors: [
        {
          message: "Compilation produced no bytecode. Check for abstract contracts or interfaces.",
          severity: "error",
        },
      ],
      warnings,
    };
  }

  return { success: true, contracts, contractNames, warnings };
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, errors: [{ message: "Rate limit exceeded. Try again later.", severity: "error" }] },
      { status: 429, headers: { "Retry-After": String(getRateLimitReset(ip)) } }
    );
  }

  // Body size check
  const body = await request.text();
  if (body.length > MAX_BODY_SIZE) {
    return NextResponse.json(
      { success: false, errors: [{ message: `Source too large (${body.length} bytes, max ${MAX_BODY_SIZE})`, severity: "error" }] },
      { status: 413 }
    );
  }

  // Parse request
  let req: CompileRequest;
  try {
    req = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { success: false, errors: [{ message: "Invalid JSON body", severity: "error" }] },
      { status: 400 }
    );
  }

  if (!req.source || typeof req.source !== "string") {
    return NextResponse.json(
      { success: false, errors: [{ message: "Missing 'source' field", severity: "error" }] },
      { status: 400 }
    );
  }

  if (req.mode !== "evm" && req.mode !== "pvm") {
    return NextResponse.json(
      { success: false, errors: [{ message: "Invalid 'mode': must be 'evm' or 'pvm'", severity: "error" }] },
      { status: 400 }
    );
  }

  try {
    // Step 1: Resolve imports from CDN
    const { sources, resolvedVersions } = await resolveAllImports(req.source);

    // Step 2: Build compiler input
    let input: string;
    if (req.mode === "pvm") {
      input = JSON.stringify({
        language: "Solidity",
        sources,
        settings: {
          optimizer: { mode: "z", enabled: true, runs: 200 },
          outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } },
        },
      });
    } else {
      input = JSON.stringify({
        language: "Solidity",
        sources,
        settings: {
          optimizer: { enabled: true, runs: 200 },
          outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
        },
      });
    }

    // Step 3: Compile in worker thread
    const output = await compileInWorker(input, req.mode);

    // Step 4: Parse output
    const result = parseCompilerOutput(output);

    return NextResponse.json({ ...result, resolvedVersions } as CompileResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown compilation error";
    return NextResponse.json(
      {
        success: false,
        errors: [{ message, severity: "error" }],
      } as CompileResponse,
      { status: message.includes("timed out") ? 408 : 500 }
    );
  }
}
