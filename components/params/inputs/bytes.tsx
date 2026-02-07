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
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import {
  bytesToHex,
  hexToBytes,
  tryDecodeUtf8,
  base64ToBytes,
  bytesToBase64,
} from "@/lib/byte-utils";

type InputMode = "hex" | "text" | "json" | "file" | "base64";

const schema = z.string().refine((value) => {
  if (value === "") return true;
  return isHex(value) && value.length % 2 === 0;
}, {
  message: "Invalid bytes (must be hex string with 0x prefix and even length)",
});

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
  const [jsonValue, setJsonValue] = React.useState("");
  const [base64Value, setBase64Value] = React.useState("");
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const [base64Error, setBase64Error] = React.useState<string | null>(null);
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
          // Try to parse as JSON
          try {
            JSON.parse(decoded);
            setJsonValue(decoded);
          } catch {
            // not JSON
          }
        }
        // Sync base64
        const bytes = hexToBytes(str);
        if (bytes) {
          setBase64Value(bytesToBase64(bytes));
        }
        setFileName(null);
      }
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const emitHex = (hex: string) => {
    setHexValue(hex);
    onChange?.(hex === "" ? undefined : hex);
  };

  // Sync other displays from hex
  const syncFromHex = (hex: string) => {
    const decoded = tryDecodeUtf8(hex);
    if (decoded !== null) setTextValue(decoded);
    const bytes = hexToBytes(hex);
    if (bytes && bytes.length > 0) {
      setBase64Value(bytesToBase64(bytes));
    }
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    const formatted = val && !val.startsWith("0x") ? `0x${val}` : val;
    setHexValue(formatted);
    syncFromHex(formatted);
    setJsonError(null);
    setBase64Error(null);
    onChange?.(formatted === "" ? undefined : formatted);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextValue(text);
    setFileName(null);
    setJsonError(null);
    setBase64Error(null);
    if (text === "") {
      emitHex("");
      return;
    }
    const encoded = new TextEncoder().encode(text);
    const hex = bytesToHex(encoded);
    setHexValue(hex);
    const bytes = hexToBytes(hex);
    if (bytes) setBase64Value(bytesToBase64(bytes));
    onChange?.(hex === "" ? undefined : hex);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    setJsonValue(raw);
    setBase64Error(null);

    if (!raw.trim()) {
      setJsonError(null);
      emitHex("");
      return;
    }

    try {
      JSON.parse(raw);
      setJsonError(null);
      // Encode the JSON string as UTF-8 bytes → hex
      const encoded = new TextEncoder().encode(raw);
      const hex = bytesToHex(encoded);
      setHexValue(hex);
      setTextValue(raw);
      const bytes = hexToBytes(hex);
      if (bytes) setBase64Value(bytesToBase64(bytes));
      onChange?.(hex === "" ? undefined : hex);
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  const handleBase64Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    setBase64Value(raw);
    setJsonError(null);

    if (!raw) {
      setBase64Error(null);
      emitHex("");
      return;
    }

    const bytes = base64ToBytes(raw);
    if (!bytes) {
      setBase64Error("Invalid Base64 string");
      return;
    }
    setBase64Error(null);
    const hex = bytesToHex(bytes);
    setHexValue(hex);
    const decoded = tryDecodeUtf8(hex);
    if (decoded !== null) setTextValue(decoded);
    onChange?.(hex === "" ? undefined : hex);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setJsonError(null);
    setBase64Error(null);
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      const hex = bytesToHex(bytes);
      setTextValue("");
      setBase64Value(bytesToBase64(bytes));
      emitHex(hex);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleModeChange = (newMode: string) => {
    const m = newMode as InputMode;
    // When switching to JSON mode, try to pre-populate
    if (m === "json" && hexValue) {
      const decoded = tryDecodeUtf8(hexValue);
      if (decoded !== null) {
        try {
          // Validate it's JSON, then pretty-print
          const parsed = JSON.parse(decoded);
          setJsonValue(JSON.stringify(parsed, null, 2));
          setJsonError(null);
        } catch {
          setJsonValue(decoded);
          setJsonError("Current data is not valid JSON");
        }
      } else {
        setJsonValue("");
        setJsonError("Current data contains non-text bytes");
      }
    }
    setMode(m);
  };

  const byteCount = hexValue && hexValue.startsWith("0x") && hexValue.length > 2
    ? (hexValue.length - 2) / 2
    : 0;

  const modeError = mode === "json" ? jsonError : mode === "base64" ? base64Error : null;
  const displayError = modeError || error;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <ModeToggle
          modes={[
            { id: "hex", label: "Hex" },
            { id: "text", label: "Text" },
            { id: "json", label: "JSON" },
            { id: "base64", label: "B64" },
            { id: "file", label: "File" },
          ]}
          activeMode={mode}
          onModeChange={handleModeChange}
          disabled={isDisabled}
        />
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

      {mode === "json" && (
        <Textarea
          id={name}
          disabled={isDisabled}
          value={jsonValue}
          onChange={handleJsonChange}
          className={`font-mono min-h-[80px] ${jsonError ? "border-red-500" : ""}`}
          placeholder='{"key": "value"}'
        />
      )}

      {mode === "base64" && (
        <Input
          id={name}
          type="text"
          disabled={isDisabled}
          value={base64Value}
          onChange={handleBase64Change}
          className={`font-mono ${base64Error ? "border-red-500" : ""}`}
          placeholder="SGVsbG8gV29ybGQ="
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
      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}

Bytes.schema = schema;
