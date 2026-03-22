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
import { useStudio } from "@/context/studio-provider";
import { compileSoliditySources } from "@/lib/compile-client";
import { contentHash } from "@/types/studio";
import {
  Upload,
  Play,
  Loader2,
  Check,
  AlertCircle,
  FileCode,
} from "lucide-react";

export function CompilerSection() {
  const { setCompilation, resetCompilation, selectContract, ...compilation } =
    useContractContext();
  const { state, dispatch, allSources, activeFile } = useStudio();

  const [isCompiling, setIsCompiling] = useState(false);
  const [bytecodeFileName, setBytecodeFileName] = useState<string | null>(null);
  const [abiFileName, setAbiFileName] = useState<string | null>(null);
  const bytecodeInputRef = useRef<HTMLInputElement>(null);
  const abiInputRef = useRef<HTMLInputElement>(null);
  const compileIdRef = useRef(0);

  const handleCompile = async () => {
    const sources = { ...allSources };
    if (Object.keys(sources).length === 0) return;

    const id = ++compileIdRef.current;
    const submittedHash = contentHash(sources);
    const submittedTarget = state.compileTarget;
    const previousContractName = compilation.contractName;

    setIsCompiling(true);
    setCompilation({ isCompiling: true, errors: [], warnings: [] });

    try {
      const result = await compileSoliditySources(sources, submittedTarget);

      // Discard if a newer compile was started or artifacts were replaced
      if (compileIdRef.current !== id) return;

      if (!result.success) {
        // Compile failure: keep previous artifacts, only update errors
        setCompilation({
          isCompiling: false,
          errors: result.errors,
          warnings: result.warnings,
        });
        return;
      }

      const contractNames = result.contractNames;

      // Contract selection on recompile:
      // 1. Keep previous selection if it still exists
      // 2. Prefer contract matching active file
      // 3. Fall back to first
      let selectedName: string | null = null;
      if (previousContractName && contractNames.includes(previousContractName)) {
        selectedName = previousContractName;
      } else if (activeFile) {
        const activeMatch = contractNames.find((cn) =>
          cn.startsWith(`${activeFile.name}:`)
        );
        if (activeMatch) selectedName = activeMatch;
      }
      if (!selectedName) selectedName = contractNames[0] || null;

      const selectedData = selectedName
        ? result.contracts?.[selectedName]
        : null;

      setCompilation({
        allContracts: result.contracts,
        contractName: selectedName,
        abi: selectedData?.abi || null,
        bytecode: selectedData?.bytecode || null,
        contractNames,
        errors: result.errors,
        warnings: result.warnings,
        isCompiling: false,
        mode: submittedTarget,
        bytecodeSource: "compile",
      });
      // Snapshot sources for per-file dirty tracking
      const sourcesSnapshot: Record<string, string> = {};
      for (const [name, { content }] of Object.entries(sources)) {
        sourcesSnapshot[name] = content;
      }
      dispatch({ type: "SET_COMPILED_HASH", hash: submittedHash, sources: sourcesSnapshot });
    } catch (err) {
      if (compileIdRef.current !== id) return;
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
      if (compileIdRef.current === id) {
        setIsCompiling(false);
      }
    }
  };

  const handleContractSelect = (name: string) => {
    selectContract(name);
  };

  // Bytecode upload (.bin/.hex)
  const handleBytecodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBytecodeFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const raw = (reader.result as string).trim().replace(/\s+/g, "");
      const normalized =
        raw.startsWith("0x") || raw.startsWith("0X")
          ? `0x${raw.slice(2).toLowerCase()}`
          : `0x${raw.toLowerCase()}`;
      if (!/^0x[0-9a-f]*$/.test(normalized) || normalized.length % 2 !== 0) {
        ++compileIdRef.current;
        setIsCompiling(false);
        resetCompilation();
        setCompilation({
          errors: [
            {
              message:
                "Invalid bytecode file: must be valid hex with even length",
              severity: "error",
            },
          ],
        });
        return;
      }
      // Full reset — bump compile token + clear local spinner
      ++compileIdRef.current;
      setIsCompiling(false);
      setCompilation({
        bytecode: normalized.slice(2),
        bytecodeSource: "upload",
        mode: null,
        abi: null,
        allContracts: null,
        contractNames: [],
        contractName: null,
        errors: [],
        warnings: [],
        isCompiling: false,
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ABI upload (.json) — does NOT touch bytecode or bump compile token
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
          errors: [
            { message: "Failed to parse ABI JSON", severity: "error" },
          ],
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Cleanup on unmount — invalidate in-flight compiles
  React.useEffect(() => {
    const ref = compileIdRef;
    return () => {
      ++ref.current;
    };
  }, []);

  const byteCount = compilation.bytecode
    ? Math.floor(compilation.bytecode.length / 2)
    : 0;
  const abiCount = compilation.abi?.length ?? 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Compile target */}
      <ModeToggle
        modes={[
          { id: "evm", label: "EVM" },
          { id: "pvm", label: "PVM (Polkadot)" },
        ]}
        activeMode={state.compileTarget}
        onModeChange={(m) =>
          dispatch({
            type: "SET_COMPILE_TARGET",
            target: m as "evm" | "pvm",
          })
        }
        disabled={isCompiling}
      />

      {/* Compile button */}
      <Button
        type="button"
        size="sm"
        disabled={isCompiling || Object.keys(allSources).length === 0}
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

      {/* Contract info card */}
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
            {abiCount > 0 && <p>ABI: {abiCount} entries</p>}
          </div>
          {!isCompiling && compilation.errors.length === 0 && compilation.bytecodeSource === "compile" && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
              <Check className="h-3 w-3" />
              Compiled
            </span>
          )}
          {compilation.bytecodeSource === "upload" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Upload className="h-3 w-3" />
              Uploaded
            </span>
          )}
        </div>
      )}

      {/* Upload section */}
      <div className="flex flex-col gap-1.5 pt-1 border-t">
        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Upload
        </span>
        <input
          ref={bytecodeInputRef}
          type="file"
          accept=".bin,.hex"
          onChange={handleBytecodeUpload}
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
          {bytecodeFileName || ".bin / .hex"}
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
              <span className="break-all">
                {err.formattedMessage || err.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
