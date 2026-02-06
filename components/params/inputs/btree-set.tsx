import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";

interface BTreeSetProps extends ParamInputProps {
  typeId: number;
}

const schema = z.array(z.any());

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

  const resolved = innerType ? findComponent(innerType.typeName, innerType.typeId) : null;
  const displayError = validationError || error;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {!isDisabled && (
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
      {description && <FormDescription>{description}</FormDescription>}
      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}

BTreeSet.schema = schema;
