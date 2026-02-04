import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ParamInputProps } from "../types";

const schema = z.number().int().min(0);

export function Moment({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
}: ParamInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onChange?.(undefined);
      return;
    }

    // Convert date-time to Unix timestamp in milliseconds
    try {
      const timestamp = new Date(value).getTime();
      onChange?.(timestamp);
    } catch {
      onChange?.(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type="datetime-local"
        disabled={isDisabled}
        onChange={handleChange}
        className="font-mono"
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Moment.schema = schema;
