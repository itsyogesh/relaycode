"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { z } from "zod";
import { isHex } from "dedot/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { ParamLabel } from "@/components/params/shared/param-label";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import {
  useContractCompilation,
  resetCompilationState,
} from "@/lib/contract-store";
import {
  getConstructorInputs,
  allConstructorTypesSupported,
  encodeConstructorArgs,
  solidityTypeLabel,
  isSupportedType,
} from "@/lib/abi-encoder";
import { Info, AlertTriangle } from "lucide-react";
import type { ParamInputProps } from "../types";

type InputMode = "abi" | "hex";

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

/**
 * Validate a hex value for an address field (0x + 40 hex chars = 20 bytes).
 */
function isValidAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

/**
 * Validate a hex value for a bytesN field (0x + 2*N hex chars).
 */
function isValidBytesN(value: string, n: number): boolean {
  if (!value || value === "0x") return true;
  return new RegExp(`^0x[0-9a-fA-F]{1,${n * 2}}$`).test(value);
}

/**
 * Validate a hex value for a dynamic bytes field.
 */
function isValidBytes(value: string): boolean {
  if (!value || value === "0x") return true;
  return /^0x[0-9a-fA-F]*$/.test(value) && value.length % 2 === 0;
}

export function ContractConstructor({
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
  const { abi } = useContractCompilation();
  const [mode, setMode] = React.useState<InputMode>("abi");
  const [hexValue, setHexValue] = React.useState("");
  const [argValues, setArgValues] = React.useState<Record<string, any>>({});
  const [forcedHex, setForcedHex] = React.useState(false);
  const isEncodingRef = useRef(false);

  const constructorInputs = abi ? getConstructorInputs(abi) : [];
  const hasConstructor = constructorInputs.length > 0;
  const typesSupported = abi ? allConstructorTypesSupported(abi) : false;

  // If ABI exists but types are unsupported, force hex mode
  useEffect(() => {
    if (abi && hasConstructor && !typesSupported && !forcedHex) {
      setForcedHex(true);
      setMode("hex");
    }
  }, [abi, hasConstructor, typesSupported, forcedHex]);

  // Auto-emit "0x" when ABI exists but constructor has no arguments
  useEffect(() => {
    if (abi && !hasConstructor) {
      onChange?.("0x");
    }
  }, [abi, hasConstructor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize bool args to false so they start in a defined state
  useEffect(() => {
    if (!abi || !hasConstructor || !typesSupported) return;
    const inputs = getConstructorInputs(abi);
    const defaults: Record<string, any> = {};
    for (const input of inputs) {
      if (input.type === "bool") defaults[input.name] = false;
    }
    if (Object.keys(defaults).length > 0) {
      setArgValues((prev) => ({ ...defaults, ...prev }));
    }
  }, [abi, hasConstructor, typesSupported]);

  // Reset compilation state on unmount
  useEffect(() => {
    return () => {
      resetCompilationState();
    };
  }, []);

  // Sync from external value (decode flow) — only in hex mode
  useEffect(() => {
    if (
      externalValue !== undefined &&
      externalValue !== null &&
      !isEncodingRef.current
    ) {
      const str = String(externalValue);
      if (str !== hexValue) {
        setHexValue(str);
      }
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate a single constructor arg value against its Solidity type
  const validateArg = useCallback((type: string, value: any): boolean => {
    // bool: false is valid, undefined means untouched
    if (type === "bool") return value !== undefined && value !== null;
    // string: empty string is valid in Solidity
    if (type === "string") return value !== undefined && value !== null;
    const v = String(value ?? "");
    if (v === "") return false; // empty is not valid for other types
    if (type === "address") {
      return /^0x[0-9a-fA-F]{40}$/.test(v);
    }
    if (type === "bool") return true;
    if (type.startsWith("uint") || type.startsWith("int")) {
      try { BigInt(v); return true; } catch { return false; }
    }
    if (type === "string") return true;
    if (type === "bytes") {
      return /^0x([0-9a-fA-F]{2})*$/.test(v);
    }
    if (/^bytes\d+$/.test(type)) {
      const n = parseInt(type.slice(5));
      return /^0x([0-9a-fA-F]{2})*$/.test(v) && (v.length - 2) / 2 <= n;
    }
    return true;
  }, []);

  // Encode constructor args whenever argValues change (ABI mode)
  const encodeAndEmit = useCallback(
    (values: Record<string, any>) => {
      if (!abi || !hasConstructor || !typesSupported) return;

      const inputs = getConstructorInputs(abi);

      // Check that at least one value has been touched before encoding
      // Note: false and "" are valid values for bool and string types
      const hasAnyValue = inputs.some((input) => {
        const v = values[input.name];
        if (v === undefined || v === null) return false;
        if (input.type === "bool") return true; // false is a valid touched value
        if (input.type === "string") return true; // "" is a valid touched value
        return v !== "";
      });

      if (!hasAnyValue) {
        onChange?.(undefined);
        return;
      }

      // Validate all args — only encode if every filled field passes validation
      const allValid = inputs.every((input) => {
        const v = values[input.name];
        if (v === undefined || v === "" || v === null) return false;
        return validateArg(input.type, v);
      });

      if (!allValid) {
        // Don't emit invalid encoded data — clear previous value
        onChange?.(undefined);
        return;
      }

      try {
        isEncodingRef.current = true;
        const encoded = encodeConstructorArgs(abi, values);
        setHexValue(encoded);
        onChange?.(encoded);
      } catch {
        // Encoding failed (e.g. invalid BigInt) — don't emit
      } finally {
        isEncodingRef.current = false;
      }
    },
    [abi, hasConstructor, typesSupported, onChange, validateArg]
  );

  const handleArgChange = (argName: string, value: any) => {
    const next = { ...argValues, [argName]: value };
    setArgValues(next);
    encodeAndEmit(next);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    const formatted = val && !val.startsWith("0x") ? `0x${val}` : val;
    setHexValue(formatted);
    onChange?.(formatted === "" ? undefined : formatted);
  };

  const handleModeChange = (newMode: string) => {
    const m = newMode as InputMode;
    if (m === "abi" && abi && hasConstructor && !typesSupported) {
      // Can't switch to ABI mode with unsupported types
      return;
    }
    setMode(m);
  };

  const renderArgInput = (input: { name: string; type: string }) => {
    const { name: argName, type: argType } = input;
    const value = argValues[argName] ?? "";

    if (argType === "bool") {
      return (
        <div key={argName} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${name}-${argName}`} className="text-xs">
              {argName}
              <span className="text-muted-foreground ml-1.5 font-normal">
                {solidityTypeLabel(argType)}
              </span>
            </Label>
            <Switch
              id={`${name}-${argName}`}
              disabled={isDisabled}
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => handleArgChange(argName, checked)}
              aria-label={argName}
            />
          </div>
        </div>
      );
    }

    let placeholder = "";
    let inputError = "";

    if (argType === "address") {
      placeholder = "0x0000000000000000000000000000000000000000";
      if (value && !isValidAddress(value)) {
        inputError = "Must be 0x + 40 hex characters (20 bytes)";
      }
    } else if (argType.startsWith("uint") || argType.startsWith("int")) {
      placeholder = "0";
      if (value && !/^-?\d+$/.test(String(value))) {
        inputError = "Must be a valid integer";
      }
    } else if (argType === "string") {
      placeholder = "Enter text value";
    } else if (argType === "bytes") {
      placeholder = "0x";
      if (value && !isValidBytes(value)) {
        inputError = "Must be hex with 0x prefix and even length";
      }
    } else if (/^bytes\d+$/.test(argType)) {
      const n = parseInt(argType.slice(5));
      placeholder = `0x (${ n } bytes)`;
      if (value && !isValidBytesN(value, n)) {
        inputError = `Must be hex with 0x prefix, max ${n * 2} hex chars`;
      }
    }

    return (
      <div key={argName} className="flex flex-col gap-1.5">
        <Label htmlFor={`${name}-${argName}`} className="text-xs">
          {argName}
          <span className="text-muted-foreground ml-1.5 font-normal">
            {solidityTypeLabel(argType)}
          </span>
        </Label>
        <Input
          id={`${name}-${argName}`}
          type="text"
          disabled={isDisabled}
          value={value}
          onChange={(e) => handleArgChange(argName, e.target.value)}
          className={`font-mono text-sm ${inputError ? "border-red-500" : ""}`}
          placeholder={placeholder}
        />
        {inputError && (
          <p className="text-xs text-red-500">{inputError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <ParamLabel htmlFor={name} label={label} typeName={typeName} isRequired={isRequired} />
        <ModeToggle
          modes={[
            { id: "abi", label: "ABI" },
            { id: "hex", label: "Hex" },
          ]}
          activeMode={mode}
          onModeChange={handleModeChange}
          disabled={isDisabled}
        />
      </div>

      {mode === "abi" && (
        <div className="flex flex-col gap-3">
          {/* No ABI yet */}
          {!abi && (
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Compile a contract above to see constructor arguments, or use
                Hex mode to enter raw data.
              </p>
            </div>
          )}

          {/* ABI exists but no constructor */}
          {abi && !hasConstructor && (
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                This contract has no constructor arguments.
              </p>
            </div>
          )}

          {/* ABI exists, has constructor, types supported — render inputs */}
          {abi && hasConstructor && typesSupported && (
            <div className="flex flex-col gap-3 rounded-md border border-border p-3">
              {constructorInputs.map((input) => renderArgInput(input))}
            </div>
          )}

          {/* ABI exists, has constructor, types NOT supported — info + forced hex */}
          {abi && hasConstructor && !typesSupported && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Constructor has complex types (arrays/tuples). Use Hex mode to
                enter ABI-encoded data, or compile externally with Remix.
              </p>
            </div>
          )}
        </div>
      )}

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

      <div className="flex items-center justify-between">
        {description && <FormDescription>{description}</FormDescription>}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

ContractConstructor.schema = schema;
