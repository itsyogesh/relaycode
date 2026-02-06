import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";

interface EnumVariant {
  name: string;
  fields?: { typeId: number; typeName?: string; name?: string }[];
  component?: React.ReactNode;
}

interface EnumProps extends ParamInputProps {
  variants?: EnumVariant[];
}

const schema = z.object({
  type: z.string(),
  value: z.any().optional(),
});

export function Enum({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  value: externalValue,
  variants: explicitVariants,
  client,
  typeId,
}: EnumProps) {
  const [selectedVariant, setSelectedVariant] = React.useState<string | undefined>();

  // Resolve variants from metadata if not explicitly provided
  const variants = React.useMemo<EnumVariant[]>(() => {
    if (explicitVariants && explicitVariants.length > 0) return explicitVariants;

    if (!client || typeId === undefined) return [];

    try {
      const portableType = client.registry.findType(typeId);
      const typeDef = portableType?.typeDef;
      if (typeDef && typeDef.type === "Enum") {
        return typeDef.value.members.map((member: any) => ({
          name: member.name,
          fields: member.fields?.map((f: any) => ({
            typeId: f.typeId,
            typeName: f.typeName,
            name: f.name,
          })),
        }));
      }
    } catch {
      // Type lookup failed
    }
    return [];
  }, [explicitVariants, client, typeId]);

  // Sync from external value (e.g., after hex decode sets { type: "Staked" })
  React.useEffect(() => {
    if (externalValue && typeof externalValue === "object" && "type" in externalValue) {
      const variantName = (externalValue as { type: string }).type;
      if (variantName !== selectedVariant) {
        setSelectedVariant(variantName);
      }
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVariantChange = (value: string) => {
    setSelectedVariant(value);
    const variant = variants.find(v => v.name === value);
    // If variant has no fields (simple variant like "Staked"), emit immediately
    if (!variant?.fields || variant.fields.length === 0) {
      onChange?.({ type: value });
    }
    // If variant has an explicit component, don't emit yet (wait for sub-component)
    // If variant has fields from metadata, don't emit yet (wait for sub-input)
  };

  const handleValueChange = (value: any) => {
    if (selectedVariant) {
      onChange?.({ type: selectedVariant, value });
    }
  };

  // Render the sub-component for the selected variant
  const renderVariantComponent = () => {
    const variant = variants.find(v => v.name === selectedVariant);
    if (!variant) return null;

    // If an explicit component was passed (legacy usage), use it
    if (variant.component && React.isValidElement(variant.component)) {
      return React.cloneElement(variant.component as React.ReactElement<any>, {
        name: `${name}-value`,
        isDisabled: isDisabled,
        onChange: handleValueChange,
      });
    }

    // If variant has fields from metadata, render dynamic sub-inputs
    if (variant.fields && variant.fields.length > 0) {
      // Single field: render inline
      if (variant.fields.length === 1) {
        const field = variant.fields[0];
        const resolved = findComponent(field.typeName || "", field.typeId, client);
        const SubComponent = resolved.component;
        // Pass the inner value from externalValue if it exists
        const innerValue = externalValue && typeof externalValue === "object" && "value" in externalValue
          ? (externalValue as any).value
          : undefined;
        return (
          <SubComponent
            client={client}
            name={`${name}-value`}
            label={field.name || field.typeName || "Value"}
            typeId={field.typeId}
            typeName={field.typeName}
            isDisabled={isDisabled}
            value={innerValue}
            onChange={handleValueChange}
          />
        );
      }

      // Multiple fields: render as a mini struct
      return (
        <div className="flex flex-col gap-2 ml-4 border-l-2 border-muted pl-4">
          {variant.fields.map((field, idx) => {
            const resolved = findComponent(field.typeName || "", field.typeId, client);
            const SubComponent = resolved.component;
            const fieldKey = field.name || `field_${idx}`;
            return (
              <SubComponent
                key={fieldKey}
                client={client}
                name={`${name}-${fieldKey}`}
                label={field.name || field.typeName || `Field ${idx}`}
                typeId={field.typeId}
                typeName={field.typeName}
                isDisabled={isDisabled}
                onChange={(val: unknown) => {
                  // For multi-field variants, collect all field values as an object
                  handleValueChange(val);
                }}
              />
            );
          })}
        </div>
      );
    }

    return null;
  };

  const hasSubComponent = React.useMemo(() => {
    const variant = variants.find(v => v.name === selectedVariant);
    if (!variant) return false;
    if (variant.component) return true;
    return variant.fields && variant.fields.length > 0;
  }, [selectedVariant, variants]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        disabled={isDisabled}
        onValueChange={handleVariantChange}
        value={selectedVariant}
      >
        <SelectTrigger id={name}>
          <SelectValue placeholder="Select variant" />
        </SelectTrigger>
        <SelectContent>
          {variants.map((variant) => (
            <SelectItem key={variant.name} value={variant.name}>
              {variant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedVariant && hasSubComponent && renderVariantComponent()}
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Enum.schema = schema;
