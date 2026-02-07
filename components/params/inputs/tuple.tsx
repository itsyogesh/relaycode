import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";

interface TupleProps extends ParamInputProps {
  typeId: number;
}

const schema = z.array(z.any());

/** Extract the last segment of a type path for a readable label */
function shortTypeName(typeName: string): string {
  // "sp_runtime::multiaddress::MultiAddress" → "MultiAddress"
  const parts = typeName.split("::");
  return parts[parts.length - 1] || typeName;
}

export function Tuple({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  client,
  typeId,
}: TupleProps) {
  const [values, setValues] = React.useState<unknown[]>([]);

  // Resolve tuple structure from registry
  const tupleFields = React.useMemo(() => {
    if (!client || typeId === undefined) return [];

    try {
      const typeInfo = client.registry.findType(typeId);
      if (typeInfo.typeDef.type === "Tuple") {
        // Tuple typeDef.value.fields is an array of typeIds
        const fieldTypeIds = typeInfo.typeDef.value.fields;
        return fieldTypeIds.map((fieldTypeId: number, index: number) => {
          const fieldTypeInfo = client.registry.findType(fieldTypeId);
          // Get a display name for the type
          const typeName = fieldTypeInfo.path?.join("::") ||
            fieldTypeInfo.typeDef.type ||
            `Element ${index}`;
          return {
            typeId: fieldTypeId,
            typeName,
            index,
          };
        });
      }
      return [];
    } catch (e) {
      console.error("Failed to resolve tuple type:", e);
      return [];
    }
  }, [client, typeId]);

  // Initialize values array when fields change
  React.useEffect(() => {
    if (tupleFields.length > 0 && values.length !== tupleFields.length) {
      setValues(new Array(tupleFields.length).fill(undefined));
    }
  }, [tupleFields.length, values.length]);

  const handleFieldChange = (index: number, value: unknown) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    onChange?.(newValues);
  };

  if (tupleFields.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <p className="text-sm text-muted-foreground">
          Unable to resolve tuple structure
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Card>
        <CardContent className="pt-4 space-y-4">
          {tupleFields.map((field) => {
            const resolved = findComponent(field.typeName, field.typeId, client);
            const Component = resolved.component;
            const fieldLabel = `${shortTypeName(field.typeName)} [${field.index}]`;
            return (
              <div key={field.index}>
                <Component
                  client={client}
                  name={`${name}-${field.index}`}
                  label={fieldLabel}
                  description={field.typeName}
                  typeId={field.typeId}
                  typeName={field.typeName}
                  isDisabled={isDisabled}
                  onChange={(value: unknown) => handleFieldChange(field.index, value)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Tuple.schema = schema;
