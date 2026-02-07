import React from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import {
  bytesToHex,
  hexToBytes,
  base64ToBytes,
  bytesToBase64,
} from "@/lib/byte-utils";

interface VectorFixedProps extends ParamInputProps {
  typeId: number;
}

const schema = z.array(z.any());

type ByteMode = "hex" | "base64";

export function VectorFixed({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  value: externalValue,
  client,
  typeId,
  typeName,
}: VectorFixedProps) {
  // Parse fixed length and inner type from typeName like "[u8; 32]"
  const { length, innerTypeName, isU8Array } = React.useMemo(() => {
    let innerName = "unknown";
    let len = 0;

    if (typeName) {
      const match = typeName.match(/^\[(.+);\s*(\d+)\]$/);
      if (match) {
        innerName = match[1].trim();
        len = parseInt(match[2], 10);
      }
    }
    // Fallback: try to get from registry
    if (len === 0 && client && typeId !== undefined) {
      try {
        const typeInfo = client.registry.findType(typeId);
        if (typeInfo.typeDef.type === "SizedVec") {
          len = typeInfo.typeDef.value.len;
          const elemTypeId = typeInfo.typeDef.value.typeParam;
          const elemType = client.registry.findType(elemTypeId);
          innerName = elemType.path?.join("::") || elemType.typeDef.type || "Element";
        }
      } catch {
        // fallback
      }
    }

    const isU8 = innerName === "u8";
    return { innerTypeName: innerName, length: len, isU8Array: isU8 };
  }, [typeName, client, typeId]);

  // --- Byte array mode (for [u8; N]) ---
  const [byteMode, setByteMode] = React.useState<ByteMode>("hex");
  const [hexInput, setHexInput] = React.useState("");
  const [base64Input, setBase64Input] = React.useState("");
  const [byteError, setByteError] = React.useState<string | null>(null);

  // Sync from external value for byte array mode
  React.useEffect(() => {
    if (!isU8Array || !externalValue) return;
    if (Array.isArray(externalValue) && externalValue.length === length) {
      const bytes = new Uint8Array(externalValue as number[]);
      const hex = bytesToHex(bytes);
      setHexInput(hex);
      setBase64Input(bytesToBase64(bytes));
      setByteError(null);
    }
  }, [externalValue, isU8Array, length]);

  const emitByteArray = (bytes: Uint8Array) => {
    onChange?.(Array.from(bytes));
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim().toLowerCase();
    const val = raw && !raw.startsWith("0x") ? `0x${raw}` : raw;
    setHexInput(val);

    if (!val || val === "0x") {
      setByteError(null);
      onChange?.(undefined);
      return;
    }

    const bytes = hexToBytes(val);
    if (!bytes) {
      setByteError("Invalid hex string");
      return;
    }
    if (bytes.length !== length) {
      setByteError(`Expected ${length} bytes, got ${bytes.length}`);
      return;
    }
    setByteError(null);
    setBase64Input(bytesToBase64(bytes));
    emitByteArray(bytes);
  };

  const handleBase64Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    setBase64Input(raw);

    if (!raw) {
      setByteError(null);
      onChange?.(undefined);
      return;
    }

    const bytes = base64ToBytes(raw);
    if (!bytes) {
      setByteError("Invalid Base64 string");
      return;
    }
    if (bytes.length !== length) {
      setByteError(`Expected ${length} bytes, got ${bytes.length}`);
      return;
    }
    setByteError(null);
    setHexInput(bytesToHex(bytes));
    emitByteArray(bytes);
  };

  // --- Per-element mode (for non-u8 types) ---
  const [values, setValues] = React.useState<unknown[]>(() =>
    new Array(length).fill(undefined)
  );

  // Reset when length changes
  React.useEffect(() => {
    if (!isU8Array && length > 0 && values.length !== length) {
      setValues(new Array(length).fill(undefined));
    }
  }, [length, values.length, isU8Array]);

  // Sync from external value for per-element mode
  React.useEffect(() => {
    if (isU8Array) return;
    if (externalValue && Array.isArray(externalValue) && externalValue.length === length) {
      setValues(externalValue);
    }
  }, [externalValue, isU8Array, length]);

  const handleItemChange = (index: number, value: unknown) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    onChange?.(newValues);
  };

  const resolved = !isU8Array && innerTypeName ? findComponent(innerTypeName) : null;

  if (length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <p className="text-sm text-muted-foreground">
          Unable to resolve fixed array structure
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // Byte array mode for [u8; N]
  if (isU8Array) {
    const displayError = byteError || error;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor={name}>
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <span className="text-xs text-muted-foreground">
              ({length} bytes)
            </span>
          </div>
          <ModeToggle
            modes={[
              { id: "hex", label: "Hex" },
              { id: "base64", label: "Base64" },
            ]}
            activeMode={byteMode}
            onModeChange={(m) => setByteMode(m as ByteMode)}
            disabled={isDisabled}
          />
        </div>
        {byteMode === "hex" ? (
          <Input
            id={name}
            type="text"
            disabled={isDisabled}
            value={hexInput}
            onChange={handleHexChange}
            className="font-mono"
            placeholder={`0x${"00".repeat(Math.min(length, 4))}...  (${length * 2} hex chars)`}
          />
        ) : (
          <Input
            id={name}
            type="text"
            disabled={isDisabled}
            value={base64Input}
            onChange={handleBase64Change}
            className="font-mono"
            placeholder={`Base64 string (decodes to ${length} bytes)`}
          />
        )}
        {description && <FormDescription>{description}</FormDescription>}
        {displayError && <p className="text-sm text-red-500">{displayError}</p>}
      </div>
    );
  }

  // Per-element mode for non-u8 types
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <span className="text-xs text-muted-foreground">
          ({length} elements)
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length }, (_, index) => (
          <div key={index} className="flex-1">
            {resolved ? (
              <resolved.component
                client={client}
                name={`${name}-${index}`}
                label={`[${index}]`}
                typeId={typeId}
                isDisabled={isDisabled}
                value={values[index]}
                onChange={(v: unknown) => handleItemChange(index, v)}
              />
            ) : (
              <input
                className="w-full rounded border px-2 py-1 text-sm font-mono"
                placeholder={`Element ${index}`}
                disabled={isDisabled}
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

VectorFixed.schema = schema;
