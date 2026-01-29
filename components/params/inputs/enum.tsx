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

interface EnumVariant {
  name: string;
  component?: React.ReactNode;
}

interface EnumProps extends ParamInputProps {
  variants: EnumVariant[];
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
  variants,
}: EnumProps) {
  const [selectedVariant, setSelectedVariant] = React.useState<string | undefined>();

  const handleVariantChange = (value: string) => {
    setSelectedVariant(value);
    const variant = variants.find(v => v.name === value);
    if (!variant?.component) {
      onChange?.({ type: value });
    }
  };

  const handleValueChange = (value: any) => {
    if (selectedVariant) {
      onChange?.({ type: selectedVariant, value });
    }
  };

  // Render the component for the selected variant if it exists
  const renderVariantComponent = () => {
    const variant = variants.find(v => v.name === selectedVariant);
    if (variant?.component && React.isValidElement(variant.component)) {
      return React.cloneElement(variant.component, {
        ...variant.component.props,
        name: `${name}-value`,
        isDisabled: isDisabled,
        onChange: handleValueChange,
      });
    }
    return null;
  };

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
      {selectedVariant && renderVariantComponent()}
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Enum.schema = schema;
