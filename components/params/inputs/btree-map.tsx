import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";

interface BTreeMapProps extends ParamInputProps {
  typeId: number;
}

const schema = z.array(z.tuple([z.any(), z.any()]));

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

  const keyResolved = keyType ? findComponent(keyType.typeName, keyType.typeId) : null;
  const valueResolved = valueType ? findComponent(valueType.typeName, valueType.typeId) : null;

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
            Add Entry
          </Button>
        )}
      </div>
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
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

BTreeMap.schema = schema;
