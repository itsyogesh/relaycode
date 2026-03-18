"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { z } from "zod";
import { isHex } from "dedot/utils";
import { useTheme } from "next-themes";
import { Upload, Play, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParamLabel } from "@/components/params/shared/param-label";
import { Input } from "@/components/ui/input";
import { FormDescription } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import {
  setCompilationState,
  resetCompilationState,
  selectContract,
  useContractCompilation,
} from "@/lib/contract-store";
import type { ParamInputProps } from "../types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type InputMode = "solidity" | "upload" | "hex";
type CompileTarget = "evm" | "pvm";

const schema = z.string().refine(
  (value) => {
    if (value === "") return true;
    return isHex(value) && value.length % 2 === 0;
  },
  {
    message:
      "Invalid bytes (must be hex string with 0x prefix and even length)",
  }
);

const DEFAULT_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    string public name;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, uint256 _initialSupply) {
        name = _name;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }
}`;

export function ContractCode({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  typeName,
  onChange,
  value: externalValue,
}: ParamInputProps) {
  const { resolvedTheme } = useTheme();
  const compilation = useContractCompilation();

  const [mode, setMode] = React.useState<InputMode>("solidity");
  const [compileTarget, setCompileTarget] =
    React.useState<CompileTarget>("pvm");
  const [source, setSource] = React.useState(DEFAULT_SOLIDITY);
  const [hexValue, setHexValue] = React.useState("");
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [abiFileName, setAbiFileName] = React.useState<string | null>(null);

  const bytecodeInputRef = useRef<HTMLInputElement>(null);
  const abiInputRef = useRef<HTMLInputElement>(null);

  // Reset compilation state on mount and unmount
  useEffect(() => {
    resetCompilationState();
    return () => {
      resetCompilationState();
    };
  }, []);

  // Sync from external value (decode flow)
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== null) {
      const str = String(externalValue);
      if (str !== hexValue) {
        setHexValue(str);
      }
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompilationState({
      isCompiling: true,
      errors: [],
      warnings: [],
    });

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, mode: compileTarget }),
      });

      const data = await res.json();

      if (!res.ok) {
        resetCompilationState();
        setCompilationState({
          isCompiling: false,
          errors: [
            {
              message: data.error || "Compilation failed",
              severity: "error",
            },
          ],
        });
        setHexValue("");
        onChange?.(undefined);
        return;
      }

      if (!data.success) {
        resetCompilationState();
        setCompilationState({
          isCompiling: false,
          errors: data.errors || [{ message: "Compilation failed", severity: "error" }],
          warnings: data.warnings || [],
        });
        setHexValue("");
        onChange?.(undefined);
        return;
      }

      // API returns { contracts: Record<name, {abi, bytecode}>, contractNames: string[] }
      // Map to contract-store's expected shape
      const allContracts = data.contracts || {};
      const contractNames = data.contractNames || [];
      const firstContract = contractNames[0] || null;
      const firstData = firstContract ? allContracts[firstContract] : null;

      setCompilationState({
        allContracts,
        contractName: firstContract,
        abi: firstData?.abi || null,
        bytecode: firstData?.bytecode || null,
        contractNames,
        errors: data.errors || [],
        warnings: data.warnings || [],
        isCompiling: false,
        mode: compileTarget,
      });

      if (firstData?.bytecode) {
        const hex = "0x" + firstData.bytecode;
        setHexValue(hex);
        onChange?.(hex);
      }
    } catch (err) {
      resetCompilationState();
      setCompilationState({
        isCompiling: false,
        errors: [
          {
            message:
              err instanceof Error ? err.message : "Network error",
            severity: "error",
          },
        ],
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleContractSelect = (contractName: string) => {
    selectContract(contractName);
    // After selectContract updates the store, read the new bytecode
    // The store is synchronous, so we can read it from compilation next render,
    // but we also need to emit onChange immediately
    const contract = compilation.allContracts?.[contractName];
    if (contract?.bytecode) {
      const hex = "0x" + contract.bytecode;
      setHexValue(hex);
      onChange?.(hex);
    }
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    const formatted = val && !val.startsWith("0x") ? `0x${val}` : val;
    setHexValue(formatted);
    onChange?.(formatted === "" ? undefined : formatted);
  };

  const handleBytecodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      // Bytecode files are text containing hex characters (e.g., "60806040...")
      // Read as text, strip whitespace/newlines, normalize 0x prefix, validate hex
      const raw = (reader.result as string).trim().replace(/\s+/g, "");
      const hex = raw.startsWith("0x") ? raw.toLowerCase() : `0x${raw.toLowerCase()}`;
      if (!/^0x[0-9a-f]*$/.test(hex) || hex.length % 2 !== 0) {
        setCompilationState({
          errors: [{ message: "Invalid bytecode file: not valid hex", severity: "error" }],
        });
        return;
      }
      setHexValue(hex);
      onChange?.(hex);
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
        setCompilationState({
          abi: Array.isArray(abi) ? abi : abi.abi || [],
          contractName: file.name.replace(/\.json$/, ""),
        });
      } catch {
        setCompilationState({
          errors: [
            {
              message: "Failed to parse ABI JSON file",
              severity: "error",
            },
          ],
        });
      }
    };
    reader.readAsText(file);
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as InputMode);
  };

  const byteCount =
    hexValue && hexValue.startsWith("0x") && hexValue.length > 2
      ? (hexValue.length - 2) / 2
      : 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Header: label + mode toggle */}
      <div className="flex items-center justify-between">
        <ParamLabel htmlFor={name} label={label} typeName={typeName} isRequired={isRequired} />
        <ModeToggle
          modes={[
            { id: "solidity", label: "Solidity" },
            { id: "upload", label: "Upload" },
            { id: "hex", label: "Hex" },
          ]}
          activeMode={mode}
          onModeChange={handleModeChange}
          disabled={isDisabled}
        />
      </div>

      {/* Solidity mode */}
      {mode === "solidity" && (
        <div className="flex flex-col gap-2">
          {/* Monaco editor */}
          <div className="rounded-md border overflow-hidden">
            <MonacoEditor
              height="280px"
              language="sol"
              theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
              value={source}
              onChange={(val) => setSource(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 4,
                readOnly: isDisabled,
                padding: { top: 8, bottom: 8 },
              }}
            />
          </div>

          {/* Compile target + compile button */}
          <div className="flex items-center gap-2">
            <ModeToggle
              modes={[
                { id: "evm", label: "EVM" },
                { id: "pvm", label: "PVM" },
              ]}
              activeMode={compileTarget}
              onModeChange={(m) => setCompileTarget(m as CompileTarget)}
              disabled={isDisabled || isCompiling}
            />
            <Button
              type="button"
              size="sm"
              disabled={isDisabled || isCompiling || !source.trim()}
              onClick={handleCompile}
              className="gap-1.5"
            >
              {isCompiling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {isCompiling ? "Compiling..." : "Compile"}
            </Button>

            {/* Success indicator */}
            {compilation.bytecode &&
              compilation.errors.length === 0 &&
              !isCompiling && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" />
                  Compiled
                </span>
              )}
          </div>

          {/* Contract selector (multi-contract) */}
          {compilation.contractNames.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Contract:
              </span>
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

          {/* Errors */}
          {compilation.errors.length > 0 && (
            <div className="flex flex-col gap-1">
              {compilation.errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-2.5 py-2"
                >
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <pre className="whitespace-pre-wrap font-mono break-all">
                    {err.formattedMessage || err.message}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {compilation.warnings.length > 0 && (
            <div className="flex flex-col gap-1">
              {compilation.warnings.map((warn, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-md px-2.5 py-2"
                >
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <pre className="whitespace-pre-wrap font-mono break-all">
                    {warn.formattedMessage || warn.message}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <div className="flex flex-col gap-2">
          {/* Bytecode file */}
          <div>
            <input
              ref={bytecodeInputRef}
              type="file"
              accept=".bin,.hex"
              onChange={handleBytecodeUpload}
              className="hidden"
              disabled={isDisabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => bytecodeInputRef.current?.click()}
              className="w-full justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {fileName || "Upload bytecode (.bin / .hex)"}
            </Button>
            {fileName && hexValue && (
              <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                {hexValue.slice(0, 42)}
                {hexValue.length > 42 ? "..." : ""}
              </p>
            )}
          </div>

          {/* Optional ABI file */}
          <div>
            <input
              ref={abiInputRef}
              type="file"
              accept=".json"
              onChange={handleAbiUpload}
              className="hidden"
              disabled={isDisabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => abiInputRef.current?.click()}
              className="w-full justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {abiFileName || "Upload ABI (.json) — optional"}
            </Button>
            {abiFileName && compilation.abi && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" />
                ABI loaded ({compilation.abi.length} entries)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hex mode */}
      {mode === "hex" && (
        <Input
          id={name}
          type="text"
          disabled={isDisabled}
          value={hexValue}
          onChange={handleHexChange}
          className="font-mono"
          placeholder="0x1234abcd"
        />
      )}

      {/* Footer: description + byte count */}
      <div className="flex items-center justify-between">
        {description && <FormDescription>{description}</FormDescription>}
        {byteCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {byteCount.toLocaleString()} byte{byteCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

ContractCode.schema = schema;
