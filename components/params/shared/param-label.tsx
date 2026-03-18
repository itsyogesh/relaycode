import React from "react";
import { Label } from "@/components/ui/label";

interface ParamLabelProps {
  htmlFor: string;
  label?: string;
  typeName?: string;
  isRequired?: boolean;
}

/**
 * Shared label for parameter input components.
 * Renders the field name + inline typeName badge so the type
 * doesn't overlap controls on the right (ModeToggle, etc.).
 */
export function ParamLabel({ htmlFor, label, typeName, isRequired }: ParamLabelProps) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center gap-2 shrink-0">
      <span>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </span>
      {typeName && (
        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded font-normal">
          {typeName}
        </span>
      )}
    </Label>
  );
}
