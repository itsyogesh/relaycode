import React from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import type { ParamInputProps } from "../types";

const schema = z.string().refine((value) => {
  try {
    // Check if it's a valid bigint
    BigInt(value);
    return true;
  } catch {
    return false;
  }
}, {
  message: "Invalid balance amount",
});

export function Balance({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
}: ParamInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    try {
      // Convert to BigInt and back to string to validate
      const bigIntValue = BigInt(value);
      onChange?.(bigIntValue.toString());
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
        type="text"
        disabled={isDisabled}
        onChange={handleChange}
        className="font-mono"
        placeholder="1000000000000"
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Balance.schema = schema;
