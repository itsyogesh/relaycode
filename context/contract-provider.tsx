"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { ContractCompilationState, CompilationError } from "@/lib/contract-store";

interface ContractContextValue extends ContractCompilationState {
  setCompilation: (update: Partial<ContractCompilationState>) => void;
  resetCompilation: () => void;
  selectContract: (name: string) => void;
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

const ContractContext = createContext<ContractContextValue>({
  ...INITIAL_STATE,
  setCompilation: () => {},
  resetCompilation: () => {},
  selectContract: () => {},
});

export const useContractContext = () => useContext(ContractContext);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContractCompilationState>({ ...INITIAL_STATE });

  const setCompilation = useCallback((update: Partial<ContractCompilationState>) => {
    setState((prev) => ({ ...prev, ...update }));
  }, []);

  const resetCompilation = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  const selectContract = useCallback((name: string) => {
    setState((prev) => {
      if (!prev.allContracts || !prev.allContracts[name]) return prev;
      const contract = prev.allContracts[name];
      return {
        ...prev,
        contractName: name,
        abi: contract.abi,
        bytecode: contract.bytecode,
      };
    });
  }, []);

  return (
    <ContractContext.Provider
      value={{
        ...state,
        setCompilation,
        resetCompilation,
        selectContract,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}
