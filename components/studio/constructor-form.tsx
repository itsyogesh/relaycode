"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getConstructorInputs,
  allConstructorTypesSupported,
  encodeConstructorArgs,
  solidityTypeLabel,
  isSupportedType,
} from "@/lib/abi-encoder";
import { AlertTriangle, Info } from "lucide-react";

interface ConstructorFormProps {
  abi: any[] | null;
  onEncodedChange: (hex: string | undefined) => void;
  /** When true, the form shows unsupported-type info without a "use hex below" message,
   *  because the parent will render its own hex fallback input. */
  hasHexFallback?: boolean;
}

export function ConstructorForm({ abi, onEncodedChange, hasHexFallback }: ConstructorFormProps) {
  const [argValues, setArgValues] = useState<Record<string, any>>({});
  const isEncodingRef = useRef(false);

  const constructorInputs = abi ? getConstructorInputs(abi) : [];
  const hasConstructor = constructorInputs.length > 0;
  const typesSupported = abi ? allConstructorTypesSupported(abi) : false;

  // Reset field values when the ABI changes (contract switch / recompile)
  useEffect(() => {
    setArgValues({});
  }, [abi]);

  // Auto-emit "0x" when ABI exists but constructor has no arguments
  useEffect(() => {
    if (abi && !hasConstructor) {
      onEncodedChange("0x");
    }
  }, [abi, hasConstructor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate a single constructor arg value against its Solidity type.
  // Mirrors the builder's validateArg in contract-constructor.tsx.
  const validateArg = useCallback((type: string, value: any): boolean => {
    if (type === "bool") return value !== undefined && value !== null;
    if (type === "string") return value !== undefined && value !== null;
    const v = String(value ?? "");
    if (v === "") return false;
    if (type === "address") return /^0x[0-9a-fA-F]{40}$/.test(v);
    if (type.startsWith("uint") || type.startsWith("int")) {
      try { BigInt(v); return true; } catch { return false; }
    }
    if (type === "bytes") return /^0x([0-9a-fA-F]{2})*$/.test(v);
    if (/^bytes\d+$/.test(type)) {
      const n = parseInt(type.slice(5));
      return /^0x([0-9a-fA-F]{2})*$/.test(v) && (v.length - 2) / 2 <= n;
    }
    return true;
  }, []);

  const encodeAndEmit = useCallback(
    (values: Record<string, any>) => {
      if (!abi || !hasConstructor || !typesSupported) return;

      const inputs = getConstructorInputs(abi);
      const hasAnyValue = inputs.some((input) => {
        const v = values[input.name];
        if (v === undefined || v === null) return false;
        if (input.type === "bool" || input.type === "string") return true;
        return v !== "";
      });

      if (!hasAnyValue) {
        onEncodedChange(undefined);
        return;
      }

      // Only encode if every field passes validation — don't emit partial/bogus data
      const allValid = inputs.every((input) => validateArg(input.type, values[input.name]));
      if (!allValid) {
        onEncodedChange(undefined);
        return;
      }

      try {
        isEncodingRef.current = true;
        const encoded = encodeConstructorArgs(abi, values);
        onEncodedChange(encoded);
      } catch {
        onEncodedChange(undefined);
      } finally {
        isEncodingRef.current = false;
      }
    },
    [abi, hasConstructor, typesSupported, onEncodedChange, validateArg]
  );

  // Initialize bool args to false and encode immediately so the parent
  // receives valid calldata without requiring a user interaction first
  useEffect(() => {
    if (!abi || !hasConstructor || !typesSupported) return;
    const inputs = getConstructorInputs(abi);
    const defaults: Record<string, any> = {};
    for (const input of inputs) {
      if (input.type === "bool") defaults[input.name] = false;
    }
    if (Object.keys(defaults).length > 0) {
      setArgValues(defaults);
      encodeAndEmit(defaults);
    }
  }, [abi, hasConstructor, typesSupported, encodeAndEmit]);

  const handleArgChange = (argName: string, value: any) => {
    const next = { ...argValues, [argName]: value };
    setArgValues(next);
    encodeAndEmit(next);
  };

  if (!abi) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-3">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Compile a contract to see constructor arguments.
        </p>
      </div>
    );
  }

  if (!hasConstructor) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-3">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          No constructor arguments.
        </p>
      </div>
    );
  }

  if (!typesSupported) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Constructor has complex types (arrays/tuples).
          {hasHexFallback
            ? " Use the hex input below to enter ABI-encoded constructor data."
            : " Compile externally with Remix and provide the encoded data."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {constructorInputs.map((input) => {
        const value = argValues[input.name] ?? "";

        if (input.type === "bool") {
          return (
            <div key={input.name} className="flex items-center justify-between">
              <Label className="text-xs">
                {input.name}
                <span className="text-muted-foreground ml-1.5 font-normal">
                  {solidityTypeLabel(input.type)}
                </span>
              </Label>
              <Switch
                checked={value === true || value === "true"}
                onCheckedChange={(checked) => handleArgChange(input.name, checked)}
              />
            </div>
          );
        }

        let placeholder = "";
        if (input.type === "address") placeholder = "0x...";
        else if (input.type.startsWith("uint") || input.type.startsWith("int")) placeholder = "0";
        else if (input.type === "string") placeholder = "Enter text";
        else if (input.type === "bytes") placeholder = "0x";

        return (
          <div key={input.name} className="flex flex-col gap-1">
            <Label className="text-xs">
              {input.name}
              <span className="text-muted-foreground ml-1.5 font-normal">
                {solidityTypeLabel(input.type)}
              </span>
            </Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => handleArgChange(input.name, e.target.value)}
              className="font-mono text-xs h-8"
              placeholder={placeholder}
            />
          </div>
        );
      })}
    </div>
  );
}
