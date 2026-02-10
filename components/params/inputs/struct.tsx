import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import type { ParamInputProps } from "../types";
import { validateStructFields } from "@/lib/validation";

interface StructField {
  name: string;
  label: string;
  description?: string;
  typeName?: string;
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
  error: externalError,
  onChange,
  fields,
}: StructProps) {
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Get list of required field names
  const requiredFieldNames = React.useMemo(() => {
    return (fields || []).filter((f) => f.required).map((f) => f.name);
  }, [fields]);

  const validateAndEmit = (newValues: Record<string, any>) => {
    // Validate required fields
    const validation = validateStructFields(newValues, requiredFieldNames);

    if (!validation.valid) {
      setValidationError(validation.error || null);
    } else {
      setValidationError(null);
    }

    // Always emit the current values so parent can track state
    onChange?.(newValues);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    const newValues = {
      ...values,
      [fieldName]: value,
    };
    setValues(newValues);
    validateAndEmit(newValues);
  };

  // Render each field with its component
  const renderFields = () => {
    return (fields || []).map((field) => {
      if (React.isValidElement(field.component)) {
        return (
          <div key={field.name} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-1">
              {React.cloneElement(field.component as React.ReactElement<any>, {
                name: `${name}-${field.name}`,
                label: (
                  <span className="flex items-center gap-1.5">
                    {field.label}
                    {field.typeName && (
                      <code className="text-[10px] px-1 py-0.5 bg-muted rounded text-muted-foreground font-mono">
                        {field.typeName}
                      </code>
                    )}
                  </span>
                ),
                description: field.description,
                isDisabled: isDisabled,
                isRequired: field.required,
                onChange: (value: any) => handleFieldChange(field.name, value),
              })}
            </div>
          </div>
        );
      }
      return null;
    });
  };

  const displayError = externalError || validationError;

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
      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}

Struct.schema = schema;
