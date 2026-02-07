import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import { parseJsonBulk } from "@/lib/bulk-parse";

interface BTreeMapProps extends ParamInputProps {
  typeId: number;
}

const schema = z.array(z.tuple([z.any(), z.any()]));

type MapMode = "form" | "json";

export function BTreeMap({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  client,
  typeId,
}: BTreeMapProps) {
  const [pairs, setPairs] = React.useState<[unknown, unknown][]>([[undefined, undefined]]);
  const [mode, setMode] = React.useState<MapMode>("form");
  const [jsonText, setJsonText] = React.useState("");
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  // Resolve key/value types from registry
  const { keyType, valueType } = React.useMemo(() => {
    if (!client || typeId === undefined) return { keyType: null, valueType: null };
    try {
      const typeInfo = client.registry.findType(typeId);
      // BTreeMap is a Sequence of Tuples in SCALE metadata
      if (typeInfo.typeDef.type === "Sequence") {
        const entryTypeId = typeInfo.typeDef.value.typeParam;
        const entryType = client.registry.findType(entryTypeId);
        if (entryType.typeDef.type === "Tuple" && entryType.typeDef.value.fields.length === 2) {
          const keyTypeId = entryType.typeDef.value.fields[0];
          const valTypeId = entryType.typeDef.value.fields[1];
          const keyTypeInfo = client.registry.findType(keyTypeId);
          const valTypeInfo = client.registry.findType(valTypeId);
          return {
            keyType: {
              typeId: keyTypeId,
              typeName: keyTypeInfo.path?.join("::") || keyTypeInfo.typeDef.type || "Key",
            },
            valueType: {
              typeId: valTypeId,
              typeName: valTypeInfo.path?.join("::") || valTypeInfo.typeDef.type || "Value",
            },
          };
        }
      }
      return { keyType: null, valueType: null };
    } catch {
      return { keyType: null, valueType: null };
    }
  }, [client, typeId]);

  const emitChange = (newPairs: [unknown, unknown][]) => {
    const filtered = newPairs.filter(([k, v]) => k !== undefined && v !== undefined);
    onChange?.(filtered);
  };

  const handleAdd = () => {
    const newPairs: [unknown, unknown][] = [...pairs, [undefined, undefined]];
    setPairs(newPairs);
    emitChange(newPairs);
  };

  const handleRemove = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    setPairs(newPairs.length === 0 ? [[undefined, undefined]] : newPairs);
    emitChange(newPairs);
  };

  const handleKeyChange = (index: number, value: unknown) => {
    const newPairs = [...pairs] as [unknown, unknown][];
    newPairs[index] = [value, newPairs[index][1]];
    setPairs(newPairs);
    emitChange(newPairs);
  };

  const handleValueChange = (index: number, value: unknown) => {
    const newPairs = [...pairs] as [unknown, unknown][];
    newPairs[index] = [newPairs[index][0], value];
    setPairs(newPairs);
    emitChange(newPairs);
  };

  const handleModeChange = (newMode: string) => {
    const m = newMode as MapMode;
    if (m === "json") {
      // Pre-populate from current pairs
      const defined = pairs.filter(([k, v]) => k !== undefined && v !== undefined);
      if (defined.length > 0) {
        try {
          const obj = Object.fromEntries(defined.map(([k, v]) => [String(k), v]));
          setJsonText(JSON.stringify(obj, null, 2));
        } catch {
          setJsonText(JSON.stringify(defined, null, 2));
        }
      }
    } else if (m === "form" && jsonText.trim()) {
      // Parse JSON back to pairs
      const result = parseJsonBulk(jsonText, true);
      if (result.success && result.count > 0) {
        const newPairs = result.values as [unknown, unknown][];
        setPairs(newPairs);
        emitChange(newPairs);
      }
      setJsonError(null);
    }
    setMode(m);
  };

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);

    if (!text.trim()) {
      setJsonError(null);
      return;
    }

    const result = parseJsonBulk(text, true);
    if (result.success) {
      setJsonError(null);
      const newPairs = result.values as [unknown, unknown][];
      setPairs(newPairs);
      emitChange(newPairs);
    } else {
      setJsonError(result.error || "Invalid JSON");
    }
  };

  const keyResolved = keyType ? findComponent(keyType.typeName, keyType.typeId) : null;
  const valueResolved = valueType ? findComponent(valueType.typeName, valueType.typeId) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          <ModeToggle
            modes={[
              { id: "form", label: "Form" },
              { id: "json", label: "JSON" },
            ]}
            activeMode={mode}
            onModeChange={handleModeChange}
            disabled={isDisabled}
          />
          {mode === "form" && !isDisabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdd}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          )}
        </div>
      </div>

      {mode === "form" ? (
        <div className="flex flex-col gap-2">
          {pairs.map((_, index) => (
            <Card key={index}>
              <CardContent className="pt-4 pb-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    {keyResolved ? (
                      <keyResolved.component
                        client={client}
                        name={`${name}-key-${index}`}
                        label="Key"
                        typeId={keyType!.typeId}
                        isDisabled={isDisabled}
                        onChange={(v: unknown) => handleKeyChange(index, v)}
                      />
                    ) : (
                      <input
                        className="w-full rounded border px-2 py-1 text-sm font-mono"
                        placeholder="Key"
                        disabled={isDisabled}
                        onChange={(e) => handleKeyChange(index, e.target.value)}
                      />
                    )}
                    {valueResolved ? (
                      <valueResolved.component
                        client={client}
                        name={`${name}-val-${index}`}
                        label="Value"
                        typeId={valueType!.typeId}
                        isDisabled={isDisabled}
                        onChange={(v: unknown) => handleValueChange(index, v)}
                      />
                    ) : (
                      <input
                        className="w-full rounded border px-2 py-1 text-sm font-mono"
                        placeholder="Value"
                        disabled={isDisabled}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                      />
                    )}
                  </div>
                  {!isDisabled && pairs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(index)}
                      className="mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Textarea
          disabled={isDisabled}
          value={jsonText}
          onChange={handleJsonTextChange}
          className={`font-mono min-h-[120px] ${jsonError ? "border-red-500" : ""}`}
          placeholder={'{"key1": "value1", "key2": "value2"}\nor\n[["key1", "value1"], ["key2", "value2"]]'}
        />
      )}

      {jsonError && mode === "json" && (
        <p className="text-sm text-red-500">{jsonError}</p>
      )}
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

BTreeMap.schema = schema;
