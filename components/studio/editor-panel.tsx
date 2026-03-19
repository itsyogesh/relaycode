"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useContractContext } from "@/context/contract-provider";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Check, AlertCircle, AlertTriangle } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface EditorPanelProps {
  source: string;
  onSourceChange: (source: string) => void;
}

export function EditorPanel({ source, onSourceChange }: EditorPanelProps) {
  const { resolvedTheme } = useTheme();
  const compilation = useContractContext();

  const hasOutput =
    compilation.errors.length > 0 ||
    compilation.warnings.length > 0 ||
    compilation.bytecode;

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ResizablePanel defaultSize={75} minSize={40}>
        <div className="h-full">
          <MonacoEditor
            height="100%"
            language="sol"
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            value={source}
            onChange={(val) => onSourceChange(val || "")}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 4,
              padding: { top: 8, bottom: 8 },
            }}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={10}>
        <div className="h-full overflow-y-auto bg-muted/30 p-3">
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
            !compilation.isCompiling && (
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
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
