import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ParamInputProps } from "../types";
import { validateVectorConstraints } from "@/lib/validation";

interface VectorProps extends ParamInputProps {
  children: React.ReactNode;
  minItems?: number;
  maxItems?: number;
}

const schema = z.array(z.any());

export function Vector({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error: externalError,
  onChange,
  children,
  minItems = 0,
  maxItems,
}: VectorProps) {
  const [items, setItems] = React.useState<any[]>([undefined]);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const validateAndEmit = (newItems: any[]) => {
    // Validate constraints
    const validation = validateVectorConstraints(
      newItems.filter((item) => item !== undefined),
      minItems,
      maxItems,
      label
    );

    if (!validation.valid) {
      setValidationError(validation.error || null);
    } else {
      setValidationError(null);
    }

    // Always emit the current values (even if invalid) so parent can track state
    onChange?.(newItems.filter((item) => item !== undefined));
  };

  const handleAdd = () => {
    if (maxItems && items.length >= maxItems) return;
    const newItems = [...items, undefined];
    setItems(newItems);
    validateAndEmit(newItems);
  };

  const handleRemove = (index: number) => {
    if (items.length <= minItems) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    validateAndEmit(newItems);
  };

  const handleItemChange = (index: number, value: any) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    validateAndEmit(newItems);
  };

  // Clone the child component for each item
  const renderItems = () => {
    return items.map((_, index) => {
      const itemComponent = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            key: index,
            name: `${name}-${index}`,
            isDisabled: isDisabled,
            onChange: (value: any) => handleItemChange(index, value),
          });
        }
        return child;
      });

      return (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">{itemComponent}</div>
          {!isDisabled && items.length > minItems && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              className="mt-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    });
  };

  const canAddMore = !maxItems || items.length < maxItems;
  const displayError = externalError || validationError;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={name}>
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {(minItems > 0 || maxItems) && (
            <span className="text-xs text-muted-foreground">
              ({minItems > 0 ? `min: ${minItems}` : ""}
              {minItems > 0 && maxItems ? ", " : ""}
              {maxItems ? `max: ${maxItems}` : ""})
            </span>
          )}
        </div>
        {!isDisabled && canAddMore && (
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
        {renderItems()}
      </div>
      {description && <FormDescription>{description}</FormDescription>}
      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}

Vector.schema = schema;
