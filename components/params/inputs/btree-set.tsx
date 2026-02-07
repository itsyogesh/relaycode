import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import { parseJsonBulk } from "@/lib/bulk-parse";

interface BTreeSetProps extends ParamInputProps {
  typeId: number;
}

const schema = z.array(z.any());

type SetMode = "form" | "json";

export function BTreeSet({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  client,
  typeId,
}: BTreeSetProps) {
  const [items, setItems] = React.useState<unknown[]>([undefined]);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<SetMode>("form");
  const [jsonText, setJsonText] = React.useState("");
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  // Resolve inner type from registry
  const innerType = React.useMemo(() => {
    if (!client || typeId === undefined) return null;
    try {
      const typeInfo = client.registry.findType(typeId);
      // BTreeSet is a Sequence in SCALE metadata
      if (typeInfo.typeDef.type === "Sequence") {
        const elemTypeId = typeInfo.typeDef.value.typeParam;
        const elemType = client.registry.findType(elemTypeId);
        return {
          typeId: elemTypeId,
          typeName: elemType.path?.join("::") || elemType.typeDef.type || "Item",
        };
      }
      return null;
    } catch {
      return null;
    }
  }, [client, typeId]);

  const emitChange = (newItems: unknown[]) => {
    const defined = newItems.filter((item) => item !== undefined);
    // Check for duplicates (basic string comparison)
    const strings = defined.map((v) => JSON.stringify(v));
    const unique = new Set(strings);
    if (unique.size < strings.length) {
      setValidationError("Set contains duplicate values");
    } else {
      setValidationError(null);
    }
    onChange?.(defined);
  };

  const handleAdd = () => {
    const newItems = [...items, undefined];
    setItems(newItems);
    emitChange(newItems);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length === 0 ? [undefined] : newItems);
    emitChange(newItems);
  };

  const handleItemChange = (index: number, value: unknown) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    emitChange(newItems);
  };

  const handleModeChange = (newMode: string) => {
    const m = newMode as SetMode;
    if (m === "json") {
      // Pre-populate from current items
      const defined = items.filter((item) => item !== undefined);
      if (defined.length > 0) {
        setJsonText(JSON.stringify(defined, null, 2));
      }
    } else if (m === "form" && jsonText.trim()) {
      // Parse JSON back to items
      const result = parseJsonBulk(jsonText);
      if (result.success && result.count > 0) {
        setItems(result.values);
        emitChange(result.values);
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

    const result = parseJsonBulk(text);
    if (result.success) {
      setJsonError(null);
      setItems(result.values);
      emitChange(result.values);
    } else {
      setJsonError(result.error || "Invalid JSON");
    }
  };

  const resolved = innerType ? findComponent(innerType.typeName, innerType.typeId) : null;
  const displayError = validationError || error || (mode === "json" ? jsonError : null);

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
              Add Item
            </Button>
          )}
        </div>
      </div>

      {mode === "form" ? (
        <div className="flex flex-col gap-2">
          {items.map((_, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                {resolved ? (
                  <resolved.component
                    client={client}
                    name={`${name}-${index}`}
                    label={`Item ${index}`}
                    typeId={innerType!.typeId}
                    isDisabled={isDisabled}
                    onChange={(v: unknown) => handleItemChange(index, v)}
                  />
                ) : (
                  <input
                    className="w-full rounded border px-2 py-1 text-sm font-mono"
                    placeholder={`Item ${index}`}
                    disabled={isDisabled}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                  />
                )}
              </div>
              {!isDisabled && items.length > 1 && (
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
          ))}
        </div>
      ) : (
        <Textarea
          disabled={isDisabled}
          value={jsonText}
          onChange={handleJsonTextChange}
          className={`font-mono min-h-[120px] ${jsonError ? "border-red-500" : ""}`}
          placeholder={'["value1", "value2", "value3"]'}
        />
      )}

      {description && <FormDescription>{description}</FormDescription>}
      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}

BTreeSet.schema = schema;
