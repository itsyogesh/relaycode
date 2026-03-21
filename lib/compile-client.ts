import type { CompilationError } from "@/lib/contract-store";

export interface CompileResult {
  success: boolean;
  contracts: Record<string, { abi: any[]; bytecode: string }> | null;
  contractNames: string[];
  errors: CompilationError[];
  warnings: CompilationError[];
}

/**
 * Compile Solidity source code via the /api/compile endpoint.
 * Shared between the builder's ContractCode component and the Studio's CompilePanel.
 */
export async function compileSolidity(
  source: string,
  mode: "evm" | "pvm"
): Promise<CompileResult> {
  const res = await fetch("/api/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, mode }),
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    // Server returned non-JSON (e.g., HTML 502/504 gateway timeout)
    return {
      success: false,
      contracts: null,
      contractNames: [],
      errors: [
        {
          message: `Server error (HTTP ${res.status}). PVM compilation may need more time — try again or use a simpler contract.`,
          severity: "error",
        },
      ],
      warnings: [],
    };
  }

  if (!res.ok) {
    return {
      success: false,
      contracts: null,
      contractNames: [],
      errors: data.errors || [
        {
          message: data.error || "Compilation failed",
          severity: "error",
        },
      ],
      warnings: [],
    };
  }

  if (!data.success) {
    return {
      success: false,
      contracts: null,
      contractNames: [],
      errors: data.errors || [{ message: "Compilation failed", severity: "error" }],
      warnings: data.warnings || [],
    };
  }

  return {
    success: true,
    contracts: data.contracts || {},
    contractNames: data.contractNames || [],
    errors: data.errors || [],
    warnings: data.warnings || [],
  };
}

const MAX_CLIENT_BODY_SIZE = 450_000; // 450KB — headroom for JSON overhead

/**
 * Compile multiple Solidity source files via the /api/compile endpoint.
 * Used by the Studio's multi-file workspace.
 */
export async function compileSoliditySources(
  sources: Record<string, { content: string }>,
  mode: "evm" | "pvm"
): Promise<CompileResult> {
  // Client-side size preflight
  const body = JSON.stringify({ sources, mode });
  if (body.length > MAX_CLIENT_BODY_SIZE) {
    return {
      success: false,
      contracts: null,
      contractNames: [],
      errors: [
        {
          message: `Source files too large (${(body.length / 1024).toFixed(0)}KB, max ~440KB). Reduce file sizes or compile externally.`,
          severity: "error",
        },
      ],
      warnings: [],
    };
  }

  const res = await fetch("/api/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    return {
      success: false,
      contracts: null,
      contractNames: [],
      errors: [
        {
          message: `Server error (HTTP ${res.status}). PVM compilation may need more time — try again or use a simpler contract.`,
          severity: "error",
        },
      ],
      warnings: [],
    };
  }

  if (!res.ok) {
    return {
      success: false,
      contracts: null,
      contractNames: [],
      errors: data.errors || [
        {
          message: data.error || "Compilation failed",
          severity: "error",
        },
      ],
      warnings: [],
    };
  }

  if (!data.success) {
    return {
      success: false,
      contracts: null,
      contractNames: [],
      errors: data.errors || [{ message: "Compilation failed", severity: "error" }],
      warnings: data.warnings || [],
    };
  }

  return {
    success: true,
    contracts: data.contracts || {},
    contractNames: data.contractNames || [],
    errors: data.errors || [],
    warnings: data.warnings || [],
  };
}
