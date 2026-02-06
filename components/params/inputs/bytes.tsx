import React, { useRef } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { ParamInputProps } from "../types";
import { isHex } from "dedot/utils";
import { Upload } from "lucide-react";

type InputMode = "hex" | "text" | "file";

const schema = z.string().refine((value) => {
  if (value === "") return true;
  return isHex(value) && value.length % 2 === 0;
}, {
  message: "Invalid bytes (must be hex string with 0x prefix and even length)",
});

function bytesToHex(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array | null {
  const stripped = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (stripped.length === 0) return new Uint8Array(0);
  if (stripped.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]+$/.test(stripped)) return null;
  const bytes = new Uint8Array(stripped.length / 2);
  for (let i = 0; i < stripped.length; i += 2) {
    bytes[i / 2] = parseInt(stripped.slice(i, i + 2), 16);
  }
  return bytes;
}

function tryDecodeUtf8(hex: string): string | null {
  const bytes = hexToBytes(hex);
  if (!bytes || bytes.length === 0) return null;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    // Reject if it contains control characters (except newline/tab) — likely binary
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text)) return null;
    return text;
  } catch {
    return null;
  }
}

export function Bytes({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  value: externalValue,
}: ParamInputProps) {
  const [mode, setMode] = React.useState<InputMode>("hex");
  const [hexValue, setHexValue] = React.useState("");
  const [textValue, setTextValue] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync from external value (decode flow)
  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== null) {
      const str = String(externalValue);
      if (str !== hexValue) {
        setHexValue(str);
        // Try to decode as UTF-8 text for text mode sync
        const decoded = tryDecodeUtf8(str);
        if (decoded !== null) {
          setTextValue(decoded);
        }
        setFileName(null);
      }
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const emitHex = (hex: string) => {
    setHexValue(hex);
    onChange?.(hex === "" ? undefined : hex);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    const formatted = val && !val.startsWith("0x") ? `0x${val}` : val;
    setHexValue(formatted);
    // Sync text display
    const decoded = tryDecodeUtf8(formatted);
    if (decoded !== null) setTextValue(decoded);
    onChange?.(formatted === "" ? undefined : formatted);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextValue(text);
    setFileName(null);
    if (text === "") {
      emitHex("");
      return;
    }
    const encoded = new TextEncoder().encode(text);
    emitHex(bytesToHex(encoded));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      const hex = bytesToHex(bytes);
      setTextValue("");
      emitHex(hex);
    };
    reader.readAsArrayBuffer(file);
  };

  const byteCount = hexValue && hexValue.startsWith("0x") && hexValue.length > 2
    ? (hexValue.length - 2) / 2
    : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex gap-1">
          {(["hex", "text", "file"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              disabled={isDisabled}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                mode === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:bg-accent"
              }`}
            >
              {m === "hex" ? "Hex" : m === "text" ? "Text" : "File"}
            </button>
          ))}
        </div>
      </div>

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

      {mode === "text" && (
        <Textarea
          id={name}
          disabled={isDisabled}
          value={textValue}
          onChange={handleTextChange}
          className="font-mono min-h-[80px]"
          placeholder="Enter text (auto-converts to hex)"
        />
      )}

      {mode === "file" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            disabled={isDisabled}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDisabled}
            onClick={() => fileInputRef.current?.click()}
            className="w-full justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {fileName || "Choose file"}
          </Button>
          {fileName && hexValue && (
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              {hexValue.slice(0, 42)}{hexValue.length > 42 ? "..." : ""}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {description && <FormDescription>{description}</FormDescription>}
        {byteCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {byteCount} byte{byteCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Bytes.schema = schema;
