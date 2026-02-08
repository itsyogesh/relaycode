"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContextHint } from "./context-hint";
import type { ParamInputProps } from "@/components/params/types";
import type { StakingContext } from "@/types/pallet-context";

export function EraSelector({
  label,
  value,
  onChange,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as StakingContext | undefined;

  const hintParts: string[] = [];
  if (ctx?.currentEra != null) hintParts.push(`Current era: ${ctx.currentEra}`);
  if (ctx?.activeEra != null) hintParts.push(`Active era: ${ctx.activeEra}`);

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange?.(Number(e.target.value))}
        placeholder={`Enter ${label}`}
      />
      {hintParts.length > 0 && (
        <ContextHint text={hintParts.join(" · ")} />
      )}
    </div>
  );
}
