import { NextRequest, NextResponse } from "next/server";
import { Worker } from "worker_threads";
import { COMPILE_WORKER_CODE } from "@/lib/compile-worker-code";
import { resolveAllImports, resolveAllImportsSources } from "@/lib/import-resolver";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limiter";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY_SIZE = 512000; // 500KB
const WORKER_TIMEOUT_MS = 30_000;

interface CompileRequest {
  source?: string;
  sources?: Record<string, { content: string }>;
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
 *
 * @param userSourceKeys — keys of the user's source files (for sorting: user files first)
 */
function parseCompilerOutput(
  output: any,
  userSourceKeys?: Set<string>
): Omit<CompileResponse, "resolvedVersions"> {
  const errors: CompileResponse["errors"] = [];
  const warnings: CompileResponse["warnings"] = [];

  if (output.errors) {
    for (const err of output.errors) {
      const msg = err.formattedMessage || err.message || "";

      if (err.severity === "warning") {
        warnings.push({
          message: err.message,
          formattedMessage: err.formattedMessage,
        });
      } else {
        // Flat-namespace hint: when a "Source not found" error has a relative import path,
        // check if the basename matches any user source key
        let hint = "";
        if (userSourceKeys) {
          const sourceMatch = msg.match(/Source "(.+?)" not found/);
          if (sourceMatch) {
            const importPath = sourceMatch[1];
            if (importPath.startsWith("./") || importPath.startsWith("../")) {
              const basename = importPath.split("/").pop() || "";
              if (userSourceKeys.has(basename)) {
                hint = ` Studio uses flat file names. Change your import to \`import "${basename}"\`.`;
              }
            }
          }
        }

        errors.push({
          message: err.message + hint,
          severity: err.severity || "error",
          formattedMessage: err.formattedMessage ? err.formattedMessage + hint : undefined,
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

  // Sort: user's files first, then dependencies
  const isUserFile = userSourceKeys
    ? (name: string) => {
        const fileName = name.split(":")[0];
        return userSourceKeys.has(fileName);
      }
    : (name: string) => name.startsWith("Contract.sol:");

  contractNames.sort((a, b) => {
    const aIsUser = isUserFile(a);
    const bIsUser = isUserFile(b);
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

  if (req.mode !== "evm" && req.mode !== "pvm") {
    return NextResponse.json(
      { success: false, errors: [{ message: "Invalid 'mode': must be 'evm' or 'pvm'", severity: "error" }] },
      { status: 400 }
    );
  }

  // Exactly one of source or sources must be provided
  const hasSource = req.source && typeof req.source === "string";
  const hasSources = req.sources && typeof req.sources === "object" && !Array.isArray(req.sources);
  if (!hasSource && !hasSources) {
    return NextResponse.json(
      { success: false, errors: [{ message: "Missing 'source' or 'sources' field", severity: "error" }] },
      { status: 400 }
    );
  }
  if (hasSource && hasSources) {
    return NextResponse.json(
      { success: false, errors: [{ message: "Provide 'source' or 'sources', not both", severity: "error" }] },
      { status: 400 }
    );
  }

  // Validate multi-file sources (flat namespace)
  let userSourceKeys: Set<string> | undefined;
  if (hasSources) {
    userSourceKeys = new Set<string>();
    for (const [key, val] of Object.entries(req.sources!)) {
      if (key.includes("/") || key.includes("..")) {
        return NextResponse.json(
          { success: false, errors: [{ message: `Invalid source key "${key}": must be a flat filename (no paths)`, severity: "error" }] },
          { status: 400 }
        );
      }
      if (!key || typeof (val as any)?.content !== "string") {
        return NextResponse.json(
          { success: false, errors: [{ message: `Invalid source entry "${key}": must have string content`, severity: "error" }] },
          { status: 400 }
        );
      }
      userSourceKeys.add(key);
    }
  }

  try {
    // Step 1: Resolve imports from CDN
    let sources: Record<string, { content: string }>;
    let resolvedVersions: Record<string, string>;

    if (hasSources) {
      const resolved = await resolveAllImportsSources(req.sources!);
      sources = resolved.sources;
      resolvedVersions = resolved.resolvedVersions;
    } else {
      const resolved = await resolveAllImports(req.source!);
      sources = resolved.sources;
      resolvedVersions = resolved.resolvedVersions;
      userSourceKeys = new Set(["Contract.sol"]);
    }

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
    const result = parseCompilerOutput(output, userSourceKeys);

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
