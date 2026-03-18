"use client";

import { useSyncExternalStore } from "react";

export interface CompilationError {
  message: string;
  severity: string;
  formattedMessage?: string;
}

export interface ContractCompilationState {
  abi: any[] | null;
  contractName: string | null;
  bytecode: string | null;
  contractNames: string[];
  allContracts: Record<string, { abi: any[]; bytecode: string }> | null;
  errors: CompilationError[];
  warnings: CompilationError[];
  isCompiling: boolean;
  mode: "evm" | "pvm";
}

const INITIAL_STATE: ContractCompilationState = {
  abi: null,
  contractName: null,
  bytecode: null,
  contractNames: [],
  allContracts: null,
  errors: [],
  warnings: [],
  isCompiling: false,
  mode: "pvm",
};

let state: ContractCompilationState = { ...INITIAL_STATE };

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function setCompilationState(
  update: Partial<ContractCompilationState>
) {
  state = { ...state, ...update };
  notify();
}

export function resetCompilationState() {
  state = { ...INITIAL_STATE };
  notify();
}

/**
 * Switch the selected contract (from a multi-contract compilation).
 * Updates abi, bytecode, and contractName from allContracts without recompiling.
 */
export function selectContract(name: string) {
  if (!state.allContracts || !state.allContracts[name]) return;
  const contract = state.allContracts[name];
  state = {
    ...state,
    contractName: name,
    abi: contract.abi,
    bytecode: contract.bytecode,
  };
  notify();
}

export function useContractCompilation(): ContractCompilationState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state
  );
}
