import React from "react";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import type { ParamInputProps } from "../types";

const schema = z.boolean();

export function Boolean({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
}: ParamInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={name}>
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <Switch
          id={name}
          disabled={isDisabled}
          onCheckedChange={onChange}
          aria-label={label}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Boolean.schema = schema;
