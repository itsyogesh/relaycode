"use client";

import React from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { ParamInputProps } from "../types";

const schema = z.string();

export function Text({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
}: ParamInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type="text"
        disabled={isDisabled}
        onChange={handleChange}
        className={cn(
          "font-mono",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
        placeholder={`Enter ${label || name}`}
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Text.schema = schema;
