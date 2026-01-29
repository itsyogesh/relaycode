import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import type { ParamInputProps } from "../types";

interface StructField {
  name: string;
  label: string;
  description?: string;
  component: React.ReactNode;
  required?: boolean;
}

interface StructProps extends ParamInputProps {
  fields: StructField[];
}

const schema = z.record(z.string(), z.any());

export function Struct({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  fields,
}: StructProps) {
  const [values, setValues] = React.useState<Record<string, any>>({});

  const handleFieldChange = (fieldName: string, value: any) => {
    const newValues = {
      ...values,
      [fieldName]: value,
    };
    setValues(newValues);
    onChange?.(newValues);
  };

  // Render each field with its component
  const renderFields = () => {
    return fields.map((field) => {
      if (React.isValidElement(field.component)) {
        return (
          <div key={field.name} className="mb-4 last:mb-0">
            {React.cloneElement(field.component, {
              ...field.component.props,
              name: `${name}-${field.name}`,
              label: field.label,
              description: field.description,
              isDisabled: isDisabled,
              isRequired: field.required,
              onChange: (value: any) => handleFieldChange(field.name, value),
            })}
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Card>
        <CardContent className="pt-6">
          {renderFields()}
        </CardContent>
      </Card>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Struct.schema = schema;
