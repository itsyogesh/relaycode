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

  const data = await res.json();

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
