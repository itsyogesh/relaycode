"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContextHint } from "./context-hint";
import { AlertCircle } from "lucide-react";

interface SelectorFallbackProps {
  label?: string;
  value?: string | number;
  onChange?: (value: unknown) => void;
  placeholder?: string;
  type?: "text" | "number";
}

export function SelectorFallback({
  label,
  value,
  onChange,
  placeholder,
  type = "number",
}: SelectorFallbackProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => {
          const val = type === "number" ? Number(e.target.value) : e.target.value;
          onChange?.(val);
        }}
        placeholder={placeholder ?? `Enter ${label}`}
      />
      <ContextHint
        text="Context unavailable — enter value manually"
        icon={<AlertCircle className="h-3 w-3 shrink-0 text-amber-500" />}
      />
    </div>
  );
}
