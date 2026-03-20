"use client";

import React from "react";
import { useAccount, useChain } from "@luno-kit/react";
import { useContractContext } from "@/context/contract-provider";
import { useStudio } from "@/context/studio-provider";
import { Check, Loader2, AlertCircle, Circle } from "lucide-react";

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function StatusBar() {
  const { chain } = useChain();
  const { account } = useAccount();
  const compilation = useContractContext();
  const { isDirtySinceCompile } = useStudio();

  const chainName = chain?.name ?? "No chain";
  const address = account?.address ?? "";

  // Artifact mode badge — shows the mode of the LAST successful compile, NOT the target toggle
  const artifactMode = compilation.mode;

  return (
    <div className="flex items-center justify-between px-3 h-7 min-h-7 bg-muted/50 border-t text-[11px] text-muted-foreground select-none">
      {/* Left: Chain + Address */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          <span>{chainName}</span>
        </div>
        {address && (
          <span className="font-mono text-[10px]">
            {truncateAddress(address)}
          </span>
        )}
      </div>

      {/* Center: Artifact mode badge */}
      <div className="flex items-center gap-2">
        {artifactMode && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
              artifactMode === "pvm"
                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}
          >
            {artifactMode}
          </span>
        )}
      </div>

      {/* Right: Compile status + dirty indicator */}
      <div className="flex items-center gap-2">
        {isDirtySinceCompile && compilation.bytecode && (
          <span className="text-yellow-600 dark:text-yellow-400">
            Modified
          </span>
        )}
        {compilation.isCompiling && (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Compiling
          </span>
        )}
        {!compilation.isCompiling &&
          compilation.bytecode &&
          compilation.errors.length === 0 &&
          compilation.bytecodeSource === "compile" && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              Compiled
            </span>
          )}
        {!compilation.isCompiling && compilation.errors.length > 0 && (
          <span className="flex items-center gap-1 text-red-500">
            <AlertCircle className="h-3 w-3" />
            {compilation.errors.length} error
            {compilation.errors.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
