import React, { useState, useEffect, useCallback, useRef } from "react";
import { $, DedotClient } from "dedot";
import {
  HexString,
  stringCamelCase,
  toHex,
  u8aToHex,
  hexStripPrefix,
  hexAddPrefix,
  xxhashAsHex,
  isHex,
} from "dedot/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GenericTxCall } from "dedot/types";
import { PolkadotApi } from "@dedot/chaintypes";
import { UseFormReturn } from "react-hook-form";
import { BuilderFormValues } from "@/app/builder/page";
import {
  encodeArg,
  decodeArg,
  encodeAllArgs,
  decodeAllArgs,
  EncodeResult,
} from "@/lib/codec";
import { Copy, Check, AlertCircle } from "lucide-react";

interface InformationPaneProps {
  client: DedotClient<PolkadotApi>;
  tx: GenericTxCall | null;
  builderForm: UseFormReturn<BuilderFormValues>;
  onTxChange: (tx: GenericTxCall) => void;
}

const DEBOUNCE_MS = 500;

function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
    }) as T,
    [delay]
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const InformationPane: React.FC<InformationPaneProps> = ({
  client,
  tx,
  builderForm,
  onTxChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [sectionHex, setSectionHex] = useState<string>("");
  const [functionHex, setFunctionHex] = useState<string>("");
  const [argHexes, setArgHexes] = useState<string[]>([]);
  const [argEncodeResults, setArgEncodeResults] = useState<EncodeResult[]>([]);
  const [encodedCallData, setEncodedCallData] = useState<string>("");
  const [encodedCallHash, setEncodedCallHash] = useState<string>("");
  const [hexEncodedCall, setHexEncodedCall] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [hasEncodingErrors, setHasEncodingErrors] = useState(false);

  // Track whether an update came from hex editing to avoid re-encoding loops
  const hexEditingRef = useRef(false);

  // Use watch subscription to avoid infinite re-render loops.
  // watch() without args returns a new ref each render, so we serialize
  // the relevant arg field values into a stable string for dependency tracking.
  const formValues = builderForm.watch();
  const argFieldNames = tx?.meta?.fields?.map((f) => f.name || "") || [];
  const argValuesKey = argFieldNames.map((n) => `${n}:${formValues[n] ?? ""}`).join("|");

  // Encode section hex
  const sectionValue = formValues.section;
  useEffect(() => {
    if (sectionValue) {
      setSectionHex(u8aToHex($.u8.tryEncode(parseInt(sectionValue.split(":")[0]))));
    } else {
      setSectionHex("");
    }
  }, [sectionValue]);

  // Encode function hex + per-arg encoding
  useEffect(() => {
    if (!tx?.meta) {
      setFunctionHex("");
      setArgHexes([]);
      setArgEncodeResults([]);
      setEncodedCallData("");
      setEncodedCallHash("");
      setHasEncodingErrors(false);
      return;
    }

    // Skip re-encoding if this update was triggered by hex editing
    if (hexEditingRef.current) {
      hexEditingRef.current = false;
      return;
    }

    const funcHex = u8aToHex($.u8.tryEncode(tx.meta.index));
    setFunctionHex(funcHex);

    // Encode all arguments using the new codec functions
    const fields = tx.meta.fields || [];
    const encodeResult = encodeAllArgs(client, fields, formValues);

    setArgHexes(encodeResult.argHexes);
    setArgEncodeResults(encodeResult.argResults);
    setHasEncodingErrors(encodeResult.hasErrors);

    // Update field errors from encoding
    const newFieldErrors: Record<string, string | null> = {};
    encodeResult.errors.forEach((error, fieldName) => {
      newFieldErrors[fieldName] = error;
    });
    // Clear errors for fields that encoded successfully
    for (const field of fields) {
      const fieldName = field.name || "";
      if (!encodeResult.errors.has(fieldName)) {
        newFieldErrors[fieldName] = null;
      }
    }
    setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));

    // Build concatenated call data
    const sectionHexStripped = hexStripPrefix(sectionHex);
    const funcHexStripped = hexStripPrefix(funcHex);
    const argsHexStripped = encodeResult.argHexes.map((h) => hexStripPrefix(h)).join("");

    const callDataRaw = sectionHexStripped + funcHexStripped + argsHexStripped;
    const callData = hexAddPrefix(callDataRaw);
    setEncodedCallData(callData);
    setEncodedCallHash(callDataRaw ? hexAddPrefix(xxhashAsHex(callDataRaw, 128)) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx, argValuesKey, sectionHex, client]);

  // Debounced decode for individual arg hex editing
  const debouncedDecodeArg = useDebouncedCallback(
    (fieldName: string, typeId: number, hex: string) => {
      if (!hex || hex === "0x") return;
      if (!isHex(hex)) {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: "Invalid hex string" }));
        return;
      }
      const result = decodeArg(client, typeId, hex);
      if (result.success) {
        hexEditingRef.current = true;
        builderForm.setValue(fieldName, result.value as string);
        setFieldErrors((prev) => ({ ...prev, [fieldName]: null }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: result.error }));
      }
    },
    DEBOUNCE_MS
  );

  // Debounced decode for full encoded call data editing
  const debouncedDecodeCallData = useDebouncedCallback(
    (hex: string) => {
      if (!tx?.meta?.fields || !hex || hex === "0x") return;
      if (!isHex(hex)) {
        setFieldErrors((prev) => ({ ...prev, _callData: "Invalid hex string" }));
        return;
      }

      // Compute actual section and function hex lengths
      const sectionHexLen = hexStripPrefix(sectionHex).length;
      const functionHexLen = hexStripPrefix(functionHex).length;
      const prefixLen = sectionHexLen + functionHexLen;

      const fullHex = hexStripPrefix(hex);
      if (fullHex.length < prefixLen) {
        setFieldErrors((prev) => ({ ...prev, _callData: "Hex too short for section and function" }));
        return;
      }

      const argsOnly = hexAddPrefix(fullHex.slice(prefixLen));
      const decoded = decodeAllArgs(client, tx.meta.fields, argsOnly);

      if (decoded.success && decoded.values) {
        hexEditingRef.current = true;
        for (const [key, value] of Object.entries(decoded.values)) {
          builderForm.setValue(key, value as string);
        }
        setFieldErrors((prev) => ({ ...prev, _callData: null }));
      } else {
        // Build error message from all field errors
        const errorMessages: string[] = [];
        decoded.errors.forEach((error, fieldName) => {
          errorMessages.push(`${fieldName}: ${error}`);
        });
        setFieldErrors((prev) => ({
          ...prev,
          _callData: errorMessages.length > 0 ? errorMessages.join("; ") : "Failed to decode call data",
        }));
      }
    },
    DEBOUNCE_MS
  );

  // Debounced decode for full hex encoded extrinsic
  const debouncedDecodeExtrinsic = useDebouncedCallback(
    (hex: string) => {
      if (!hex) return;
      try {
        const newTx = client.registry.$Extrinsic.tryDecode(hex);
        const palletCall = newTx.call.palletCall;
        if (!palletCall) return;
        const callName =
          typeof palletCall === "string" ? palletCall : palletCall.name;
        const newTransaction =
          client.tx[stringCamelCase(newTx.call.pallet)][
            stringCamelCase(callName)
          ];
        onTxChange(newTransaction);
        setFieldErrors((prev) => ({ ...prev, _extrinsic: null }));
      } catch {
        setFieldErrors((prev) => ({ ...prev, _extrinsic: "Failed to decode extrinsic" }));
      }
    },
    DEBOUNCE_MS
  );

  const handleArgHexChange = (index: number, fieldName: string, typeId: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!editing) return;
    const newHex = e.target.value;
    setArgHexes((prev) => {
      const next = [...prev];
      next[index] = newHex;
      return next;
    });
    debouncedDecodeArg(fieldName, typeId, newHex);
  };

  const handleEncodedCallDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const newCallData = e.target.value;
    setEncodedCallData(newCallData);
    debouncedDecodeCallData(newCallData);
  };

  const handleHexEncodedCall = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editing) return;
    const hex = e.target.value;
    setHexEncodedCall(hex);
    debouncedDecodeExtrinsic(hex);
  };

  const renderColorCodedCallData = () => {
    if (!encodedCallData || encodedCallData === "0x") return null;

    // If there are encoding errors, fall back to monochrome display
    if (hasEncodingErrors) {
      return (
        <div className="font-mono break-all text-sm">
          <span className="text-gray-500">{encodedCallData}</span>
          <span className="ml-2 text-amber-500 text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Color coding unavailable due to encoding errors
          </span>
        </div>
      );
    }

    const raw = hexStripPrefix(encodedCallData);
    const prefix = "0x";

    // Use actual hex lengths for section and function
    const sectionLen = hexStripPrefix(sectionHex).length;
    const funcLen = hexStripPrefix(functionHex).length;

    const section = raw.slice(0, sectionLen);
    const func = raw.slice(sectionLen, sectionLen + funcLen);

    // Compute per-arg byte boundaries for color coding
    const argParts: { hex: string; name: string }[] = [];
    let pos = sectionLen + funcLen;
    const fields = tx?.meta?.fields || [];
    for (let i = 0; i < argHexes.length; i++) {
      const stripped = hexStripPrefix(argHexes[i]);
      const name = fields[i]?.name || `arg${i}`;
      argParts.push({ hex: raw.slice(pos, pos + stripped.length), name });
      pos += stripped.length;
    }
    // Any remaining bytes (shouldn't happen normally)
    const remainder = raw.slice(pos);

    // Cycle through distinct blue shades for args
    const argColors = [
      "text-blue-500",
      "text-cyan-500",
      "text-indigo-500",
      "text-violet-500",
    ];

    return (
      <div className="font-mono break-all text-sm">
        <span className="text-gray-500">{prefix}</span>
        <span className="text-red-500" title="Section index">{section}</span>
        <span className="text-green-500" title="Function index">{func}</span>
        {argParts.map((part, i) => (
          <span
            key={i}
            className={argColors[i % argColors.length]}
            title={stringCamelCase(part.name)}
          >
            {part.hex}
          </span>
        ))}
        {remainder && <span className="text-gray-400">{remainder}</span>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Information Pane</h2>
        <div className="flex items-center space-x-2">
          <Switch
            id="editing-mode"
            checked={editing}
            onCheckedChange={setEditing}
          />
          <Label htmlFor="editing-mode">Enable Editing</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Section Hex</Label>
          <div className="flex items-center">
            <Input
              value={sectionHex}
              disabled={true}
              className="font-mono text-red-500"
            />
            {sectionHex && <CopyButton text={sectionHex} />}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Function Hex</Label>
          <div className="flex items-center">
            <Input
              value={functionHex}
              disabled={true}
              className="font-mono text-green-500"
            />
            {functionHex && <CopyButton text={functionHex} />}
          </div>
        </div>

        {tx?.meta?.fields?.map((arg, index) => {
          const fieldName = arg.name || "";
          const error = fieldErrors[fieldName];
          const encodeResult = argEncodeResults[index];
          const hasError = error || (encodeResult && !encodeResult.success);
          return (
            <div key={index}>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {stringCamelCase(fieldName)} Hex
                </Label>
                <span className="text-xs text-gray-400 font-mono">
                  {arg.typeName || `typeId: ${arg.typeId}`}
                </span>
              </div>
              <div className="flex items-center">
                <Input
                  value={argHexes[index] || "0x"}
                  onChange={handleArgHexChange(index, fieldName, arg.typeId)}
                  disabled={!editing}
                  className={`font-mono text-blue-500 ${hasError ? "border-red-500" : ""}`}
                />
                {argHexes[index] && argHexes[index] !== "0x" && (
                  <CopyButton text={argHexes[index]} />
                )}
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
              {!error && encodeResult && !encodeResult.success && (
                <p className="text-xs text-red-500 mt-1">{encodeResult.error}</p>
              )}
            </div>
          );
        })}

        <div>
          <Label className="text-sm font-medium">Encoded Call Data</Label>
          {editing ? (
            <div>
              <Input
                value={encodedCallData}
                onChange={handleEncodedCallDataChange}
                className={`font-mono ${fieldErrors._callData ? "border-red-500" : ""}`}
              />
              {fieldErrors._callData && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors._callData}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <div className="flex-1">
                {renderColorCodedCallData()}
              </div>
              {encodedCallData && encodedCallData !== "0x" && (
                <CopyButton text={encodedCallData} />
              )}
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">Encoded Call Hash</Label>
          <div className="flex items-center">
            <Input
              value={encodedCallHash}
              disabled={true}
              className="font-mono"
            />
            {encodedCallHash && <CopyButton text={encodedCallHash} />}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Hex Encoded Call Data</Label>
          <Textarea
            value={hexEncodedCall}
            disabled={!editing}
            className={`font-mono ${fieldErrors._extrinsic ? "border-red-500" : ""}`}
            onChange={handleHexEncodedCall}
            placeholder="Paste a full hex-encoded extrinsic to decode..."
          />
          {fieldErrors._extrinsic && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors._extrinsic}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InformationPane;
