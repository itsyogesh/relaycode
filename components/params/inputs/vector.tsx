import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { ParamInputProps } from "../types";
import { validateVectorConstraints } from "@/lib/validation";
import { findComponent } from "@/lib/input-map";
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import { parseJsonBulk, parseSeparatedValues } from "@/lib/bulk-parse";

interface VectorProps extends ParamInputProps {
  children?: React.ReactNode;
  minItems?: number;
  maxItems?: number;
  unique?: boolean;
}

const schema = z.array(z.any());

type VectorMode = "form" | "bulk";

export function Vector({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error: externalError,
  onChange,
  value: externalValue,
  children,
  client,
  typeId,
  minItems = 0,
  maxItems,
  unique = false,
}: VectorProps) {
  const [items, setItems] = React.useState<any[]>([undefined]);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<VectorMode>("form");
  const [bulkText, setBulkText] = React.useState("");
  const [bulkError, setBulkError] = React.useState<string | null>(null);
  const [duplicateMessage, setDuplicateMessage] = React.useState<string | null>(null);
  const lastEmittedRef = React.useRef<string>("");

  // Resolve the inner element type from metadata
  const innerType = React.useMemo(() => {
    if (!client || typeId === undefined) return null;
    try {
      const typeInfo = client.registry.findType(typeId);
      const typeDef = typeInfo?.typeDef;
      if (typeDef && typeDef.type === "Sequence") {
        const elemTypeId = typeDef.value.typeParam;
        const elemType = client.registry.findType(elemTypeId);
        // Extract typeName from the path array (last element is the type name)
        const path = (elemType as any)?.path as string[] | undefined;
        const typeName = path && path.length > 0 ? path[path.length - 1] : "";
        return {
          typeId: elemTypeId,
          typeName,
        };
      }
    } catch {
      // Type lookup failed
    }
    return null;
  }, [client, typeId]);

  // Sync from external value (e.g., after hex decode)
  // Skip if the external value matches what we last emitted (avoids overriding local state)
  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== null && Array.isArray(externalValue)) {
      const externalStr = JSON.stringify(externalValue);
      if (externalStr !== lastEmittedRef.current && externalValue.length > 0) {
        setItems(externalValue);
      }
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for duplicates whenever items change
  React.useEffect(() => {
    const defined = items.filter((item) => item !== undefined);
    if (defined.length < 2) {
      setDuplicateMessage(null);
      return;
    }
    const strings = defined.map((v) => JSON.stringify(v));
    const seen = new Map<string, number[]>();
    strings.forEach((s, i) => {
      const existing = seen.get(s);
      if (existing) existing.push(i);
      else seen.set(s, [i]);
    });
    const dupes = Array.from(seen.values()).filter((positions) => positions.length > 1);
    if (dupes.length > 0) {
      const positions = dupes.flat().join(", ");
      if (unique) {
        setDuplicateMessage(`Set contains duplicate values at positions ${positions}`);
      } else {
        setDuplicateMessage(`Duplicate values at positions ${positions}`);
      }
    } else {
      setDuplicateMessage(null);
    }
  }, [items, unique]);

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
    const defined = newItems.filter((item) => item !== undefined);
    lastEmittedRef.current = JSON.stringify(defined);
    onChange?.(defined);
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
    setItems(newItems.length === 0 ? [undefined] : newItems);
    validateAndEmit(newItems);
  };

  const handleItemChange = (index: number, value: any) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    validateAndEmit(newItems);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    validateAndEmit(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    validateAndEmit(newItems);
  };

  const handleModeChange = (newMode: string) => {
    const m = newMode as VectorMode;
    if (m === "bulk") {
      // Pre-populate bulk text from current items
      const defined = items.filter((item) => item !== undefined);
      if (defined.length > 0) {
        try {
          setBulkText(JSON.stringify(defined, null, 2));
        } catch {
          if (!unique) {
            setBulkText(defined.map(String).join("\n"));
          }
        }
      }
    } else if (m === "form" && bulkText.trim()) {
      // Try to parse bulk text back to items
      const jsonResult = parseJsonBulk(bulkText);
      if (jsonResult.success) {
        setItems(jsonResult.values);
        validateAndEmit(jsonResult.values);
      } else if (!unique) {
        // Line-separated fallback only for non-unique (Vector) mode
        const lineResult = parseSeparatedValues(bulkText);
        if (lineResult.success && lineResult.count > 0) {
          setItems(lineResult.values);
          validateAndEmit(lineResult.values);
        }
      }
      setBulkError(null);
    }
    setMode(m);
  };

  const handleBulkTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setBulkText(text);

    if (!text.trim()) {
      setBulkError(null);
      return;
    }

    // Try JSON first
    const jsonResult = parseJsonBulk(text);
    if (jsonResult.success) {
      setBulkError(null);
      setItems(jsonResult.values);
      validateAndEmit(jsonResult.values);
      return;
    }

    // Try line-separated (only for non-unique / Vector mode)
    if (!unique) {
      const lineResult = parseSeparatedValues(text);
      if (lineResult.success && lineResult.count > 0) {
        setBulkError(null);
        setItems(lineResult.values);
        validateAndEmit(lineResult.values);
        return;
      }
    }

    setBulkError(jsonResult.error || "Could not parse input");
  };

  // Clone the child component for each item
  const renderItems = () => {
    return items.map((itemValue, index) => {
      let itemComponent: React.ReactNode;

      if (children) {
        // Legacy usage: clone provided children
        itemComponent = React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              key: index,
              name: `${name}-${index}`,
              isDisabled: isDisabled,
              value: itemValue,
              onChange: (value: any) => handleItemChange(index, value),
            });
          }
          return child;
        });
      } else if (innerType) {
        // Self-resolving: derive inner component from metadata
        const resolved = findComponent(innerType.typeName, innerType.typeId, client);
        const InnerComponent = resolved.component;
        itemComponent = (
          <InnerComponent
            client={client}
            name={`${name}-${index}`}
            label={unique ? `Item ${index}` : `${label || name} [${index}]`}
            typeId={innerType.typeId}
            typeName={innerType.typeName}
            isDisabled={isDisabled}
            value={itemValue}
            onChange={(value: any) => handleItemChange(index, value)}
          />
        );
      } else {
        return null;
      }

      return (
        <div key={index} className="flex items-start gap-1">
          <div className="flex-1">{itemComponent}</div>
          {/* Reorder controls: only for ordered collections (not sets) */}
          {!isDisabled && !unique && (
            <div className="flex flex-col gap-0.5 mt-8">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleMoveDown(index)}
                disabled={index >= items.length - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          )}
          {!isDisabled && items.length > (unique ? 1 : minItems) && (
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
  const bulkModeLabel = unique ? "JSON" : "Bulk";
  const bulkPlaceholder = unique
    ? '["value1", "value2", "value3"]'
    : 'Paste JSON array or one value per line:\n["value1", "value2"]\nor\nvalue1\nvalue2';

  // For unique mode, duplicates are errors (red); for Vector mode, they are warnings (yellow)
  const duplicateIsError = unique && !!duplicateMessage;
  const displayError =
    externalError ||
    validationError ||
    (mode === "bulk" ? bulkError : null) ||
    (duplicateIsError ? duplicateMessage : null);

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
        <div className="flex items-center gap-2">
          <ModeToggle
            modes={[
              { id: "form", label: "Form" },
              { id: "bulk", label: bulkModeLabel },
            ]}
            activeMode={mode}
            onModeChange={handleModeChange}
            disabled={isDisabled}
          />
          {mode === "form" && !isDisabled && canAddMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdd}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {unique ? "Add Item" : "Add"}
            </Button>
          )}
        </div>
      </div>

      {mode === "form" ? (
        <div className="flex flex-col gap-2">
          {renderItems()}
        </div>
      ) : (
        <Textarea
          disabled={isDisabled}
          value={bulkText}
          onChange={handleBulkTextChange}
          className={`font-mono min-h-[120px] ${bulkError ? "border-red-500" : ""}`}
          placeholder={bulkPlaceholder}
        />
      )}

      {/* Duplicate warning (yellow) for Vector mode only; unique mode shows as error above */}
      {duplicateMessage && !unique && mode === "form" && (
        <p className="text-xs text-yellow-600">{duplicateMessage}</p>
      )}
      {description && <FormDescription>{description}</FormDescription>}
      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}

Vector.schema = schema;

// BTreeSet convenience wrapper — unique-value collection
export function BTreeSet(props: ParamInputProps) {
  return <Vector {...props} unique />;
}

BTreeSet.schema = schema;
