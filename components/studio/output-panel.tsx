"use client";

import React from "react";
import { useContractContext } from "@/context/contract-provider";
import { Check, AlertCircle, AlertTriangle, ChevronDown, ChevronRight, Upload } from "lucide-react";

interface OutputPanelProps {
  visible: boolean;
  onToggle: () => void;
}

export function OutputPanel({ visible, onToggle }: OutputPanelProps) {
  const compilation = useContractContext();

  const hasOutput =
    compilation.errors.length > 0 ||
    compilation.warnings.length > 0 ||
    compilation.bytecode ||
    compilation.isCompiling;

  const errorCount = compilation.errors.length;
  const warningCount = compilation.warnings.length;

  return (
    <div className="flex flex-col h-full">
      {/* Toggle header */}
      <button
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent/30 transition-colors"
        onClick={onToggle}
      >
        {visible ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span className="font-medium">Output</span>
        {errorCount > 0 && (
          <span className="text-red-500">{errorCount} error{errorCount > 1 ? "s" : ""}</span>
        )}
        {warningCount > 0 && (
          <span className="text-yellow-600 dark:text-yellow-400">
            {warningCount} warning{warningCount > 1 ? "s" : ""}
          </span>
        )}
        {!compilation.isCompiling &&
          compilation.bytecode &&
          errorCount === 0 &&
          compilation.bytecodeSource === "compile" && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              Compiled
              {compilation.contractName && (
                <span className="text-muted-foreground">
                  ({compilation.contractName})
                </span>
              )}
            </span>
          )}
        {!compilation.isCompiling &&
          compilation.bytecode &&
          compilation.bytecodeSource === "upload" && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Upload className="h-3 w-3" />
              Uploaded
            </span>
          )}
      </button>

      {/* Content */}
      {visible && (
        <div className="flex-1 overflow-y-auto bg-muted/30 px-3 py-2 min-h-0">
          {!hasOutput && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Output will appear here after compilation
            </p>
          )}

          {compilation.isCompiling && (
            <p className="text-xs text-muted-foreground">Compiling...</p>
          )}

          {compilation.bytecode &&
            compilation.errors.length === 0 &&
            !compilation.isCompiling &&
            compilation.bytecodeSource === "compile" && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mb-2">
                <Check className="h-3.5 w-3.5" />
                Compiled successfully
                {compilation.contractName && (
                  <span className="text-muted-foreground ml-1">
                    ({compilation.contractName})
                  </span>
                )}
              </div>
            )}

          {compilation.errors.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-2">
              {compilation.errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <pre className="whitespace-pre-wrap font-mono break-all text-[11px]">
                    {err.formattedMessage || err.message}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {compilation.warnings.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {compilation.warnings.map((warn, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-yellow-700 dark:text-yellow-400"
                >
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                  <pre className="whitespace-pre-wrap font-mono break-all text-[11px]">
                    {warn.formattedMessage || warn.message}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
