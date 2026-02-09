"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContextHint } from "./context-hint";
import type { ParamInputProps } from "@/components/params/types";
import type { VestingContext } from "@/types/pallet-context";
import { fromPlanck, type Denomination } from "@/lib/denominations";

export function VestingInfoDisplay({
  label,
  value,
  onChange,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as VestingContext | undefined;

  const tokenDenom: Denomination = useMemo(() => ({
    label: ctx?.tokenSymbol ?? "DOT",
    multiplier: BigInt(10) ** BigInt(ctx?.tokenDecimals ?? 10),
    maxDecimals: ctx?.tokenDecimals ?? 10,
  }), [ctx?.tokenSymbol, ctx?.tokenDecimals]);

  const hintParts: string[] = [];
  if (ctx?.minVestedTransfer) {
    hintParts.push(
      `Min vested transfer: ${fromPlanck(ctx.minVestedTransfer, tokenDenom)} ${tokenDenom.label}`
    );
  }

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={`Enter ${label}`}
      />
      {hintParts.length > 0 && (
        <ContextHint text={hintParts.join(" · ")} />
      )}
    </div>
  );
}
