"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import { useContractContext } from "@/context/contract-provider";
import { compileSolidity } from "@/lib/compile-client";
import { Upload, Play, Loader2, Check, AlertCircle, FileCode } from "lucide-react";

interface CompilePanelProps {
  source: string;
  onSourceChange: (source: string) => void;
}

export function CompilePanel({ source, onSourceChange }: CompilePanelProps) {
  const { setCompilation, resetCompilation, selectContract, ...compilation } =
    useContractContext();
  const [compileTarget, setCompileTarget] = useState<"evm" | "pvm">("pvm");
  const [isCompiling, setIsCompiling] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [abiFileName, setAbiFileName] = useState<string | null>(null);
  const bytecodeInputRef = useRef<HTMLInputElement>(null);
  const abiInputRef = useRef<HTMLInputElement>(null);

  const handleCompile = async () => {
    if (!source.trim()) return;
    setIsCompiling(true);
    setCompilation({ isCompiling: true, errors: [], warnings: [] });

    try {
      const result = await compileSolidity(source, compileTarget);

      if (!result.success) {
        resetCompilation();
        setCompilation({
          isCompiling: false,
          errors: result.errors,
          warnings: result.warnings,
        });
        return;
      }

      const contractNames = result.contractNames;
      const firstContract = contractNames[0] || null;
      const firstData = firstContract ? result.contracts?.[firstContract] : null;

      setCompilation({
        allContracts: result.contracts,
        contractName: firstContract,
        abi: firstData?.abi || null,
        bytecode: firstData?.bytecode || null,
        contractNames,
        errors: result.errors,
        warnings: result.warnings,
        isCompiling: false,
        mode: compileTarget,
      });
    } catch (err) {
      resetCompilation();
      setCompilation({
        isCompiling: false,
        errors: [
          {
            message: err instanceof Error ? err.message : "Network error",
            severity: "error",
          },
        ],
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleContractSelect = (name: string) => {
    selectContract(name);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;

      // .sol files → load into editor
      if (file.name.endsWith(".sol")) {
        onSourceChange(content);
        return;
      }

      // .bin / .hex → parse as hex bytecode
      const raw = content.trim().replace(/\s+/g, "");
      const normalized = raw.startsWith("0x") || raw.startsWith("0X")
        ? `0x${raw.slice(2).toLowerCase()}`
        : `0x${raw.toLowerCase()}`;
      if (!/^0x[0-9a-f]*$/.test(normalized) || normalized.length % 2 !== 0) {
        setCompilation({
          bytecode: null,
          allContracts: null,
          contractNames: [],
          errors: [{ message: "Invalid bytecode file: must be valid hex with even length", severity: "error" }],
        });
        return;
      }
      setCompilation({
        bytecode: normalized.slice(2), // store without 0x prefix
        errors: [],
      });
    };
    reader.readAsText(file);
  };

  const handleAbiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAbiFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const abi = JSON.parse(reader.result as string);
        setCompilation({
          abi: Array.isArray(abi) ? abi : abi.abi || [],
          contractName: file.name.replace(/\.json$/, ""),
        });
      } catch {
        setCompilation({
          abi: null,
          contractName: null,
          bytecode: null,
          allContracts: null,
          contractNames: [],
          errors: [{ message: "Failed to parse ABI JSON", severity: "error" }],
        });
      }
    };
    reader.readAsText(file);
  };

  const byteCount = compilation.bytecode
    ? Math.floor(compilation.bytecode.length / 2)
    : 0;
  const abiCount = compilation.abi?.length ?? 0;

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-y-auto">
      {/* Compile section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Compile
        </h3>
        <ModeToggle
          modes={[
            { id: "evm", label: "EVM" },
            { id: "pvm", label: "PVM" },
          ]}
          activeMode={compileTarget}
          onModeChange={(m) => setCompileTarget(m as "evm" | "pvm")}
          disabled={isCompiling}
        />
        <Button
          type="button"
          size="sm"
          disabled={isCompiling || !source.trim()}
          onClick={handleCompile}
          className="gap-1.5 w-full"
        >
          {isCompiling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {isCompiling ? "Compiling..." : "Compile"}
        </Button>
      </div>

      {/* Contract selector */}
      {compilation.contractNames.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Contract</span>
          <Select
            value={compilation.contractName || ""}
            onValueChange={handleContractSelect}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select contract" />
            </SelectTrigger>
            <SelectContent>
              {compilation.contractNames.map((cn) => (
                <SelectItem key={cn} value={cn} className="text-xs">
                  {cn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Info */}
      {compilation.bytecode && (
        <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/50 p-2.5">
          <div className="flex items-center gap-1.5">
            <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">
              {compilation.contractName || "Contract"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>{byteCount.toLocaleString()} bytes</p>
            {abiCount > 0 && (
              <p>ABI: {abiCount} entries</p>
            )}
          </div>
          {!isCompiling && compilation.errors.length === 0 && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
              <Check className="h-3 w-3" />
              Compiled
            </span>
          )}
        </div>
      )}

      {/* Upload section */}
      <div className="flex flex-col gap-2 mt-auto">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Upload
        </h3>
        <input
          ref={bytecodeInputRef}
          type="file"
          accept=".bin,.hex,.sol"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => bytecodeInputRef.current?.click()}
          className="w-full justify-center gap-2 text-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          {fileName || ".sol / .bin"}
        </Button>
        <input
          ref={abiInputRef}
          type="file"
          accept=".json"
          onChange={handleAbiUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => abiInputRef.current?.click()}
          className="w-full justify-center gap-2 text-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          {abiFileName || ".json (ABI)"}
        </Button>
      </div>

      {/* Errors */}
      {compilation.errors.length > 0 && (
        <div className="flex flex-col gap-1">
          {compilation.errors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-2 py-1.5"
            >
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <span className="break-all">{err.formattedMessage || err.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
