import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";

interface VectorFixedProps extends ParamInputProps {
  typeId: number;
}

const schema = z.array(z.any());

export function VectorFixed({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  client,
  typeId,
  typeName,
}: VectorFixedProps) {
  // Parse fixed length from typeName like "[u8; 32]"
  const { length, innerTypeName } = React.useMemo(() => {
    if (typeName) {
      const match = typeName.match(/^\[(.+);\s*(\d+)\]$/);
      if (match) {
        return { innerTypeName: match[1].trim(), length: parseInt(match[2], 10) };
      }
    }
    // Fallback: try to get from registry
    if (client && typeId !== undefined) {
      try {
        const typeInfo = client.registry.findType(typeId);
        if (typeInfo.typeDef.type === "SizedVec") {
          const len = typeInfo.typeDef.value.len;
          const elemTypeId = typeInfo.typeDef.value.typeParam;
          const elemType = client.registry.findType(elemTypeId);
          const elemName = elemType.path?.join("::") || elemType.typeDef.type || "Element";
          return { innerTypeName: elemName, length: len };
        }
      } catch {
        // fallback
      }
    }
    return { innerTypeName: "unknown", length: 0 };
  }, [typeName, client, typeId]);

  const [values, setValues] = React.useState<unknown[]>(() =>
    new Array(length).fill(undefined)
  );

  // Reset when length changes
  React.useEffect(() => {
    if (length > 0 && values.length !== length) {
      setValues(new Array(length).fill(undefined));
    }
  }, [length, values.length]);

  const handleItemChange = (index: number, value: unknown) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    onChange?.(newValues);
  };

  const resolved = innerTypeName ? findComponent(innerTypeName) : null;

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
