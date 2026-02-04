import React from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import type { ParamInputProps } from "../types";
import { isHex } from "dedot/utils";

const schema = z.string().refine((value) => {
  // Allow empty string
  if (value === "") return true;
  // Must be hex string with 0x prefix and even length
  return isHex(value) && value.length % 2 === 0;
}, {
  message: "Invalid bytes (must be hex string with 0x prefix and even length)",
});

export function Bytes({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
}: ParamInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    
    // Add 0x prefix if not present and value is not empty
    const formattedValue = value && !value.startsWith("0x") ? `0x${value}` : value;
    onChange?.(formattedValue === "" ? undefined : formattedValue);
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
        placeholder="0x1234abcd"
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Bytes.schema = schema;
