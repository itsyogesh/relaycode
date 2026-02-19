"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { ContextHint } from "./context-hint";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { CoretimeContext } from "@/types/pallet-context";
import { fromPlanck, type Denomination } from "@/lib/denominations";

export function CoreSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as CoretimeContext | undefined;
  const cores = useMemo(() => ctx?.cores ?? [], [ctx?.cores]);

  const tokenDenom: Denomination = useMemo(
    () => ({
      label: ctx?.tokenSymbol ?? "DOT",
      multiplier: BigInt(10) ** BigInt(ctx?.tokenDecimals ?? 10),
      maxDecimals: ctx?.tokenDecimals ?? 10,
    }),
    [ctx?.tokenSymbol, ctx?.tokenDecimals]
  );

  return (
    <ContextCombobox
      items={cores}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select core..."
      searchPlaceholder="Search cores..."
      emptyMessage="No cores found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && cores.length > 0}
      getItemValue={(c) => c.core}
      searchFilter={(c, q) => String(c.core).includes(q)}
      triggerClassName="h-10"
      itemClassName="flex items-center gap-2"
      renderTriggerContent={(selected) => (
        <span className="truncate">Core #{selected.core}</span>
      )}
      renderItem={(core, isSelected) => (
        <>
          <span className="font-mono text-xs shrink-0">#{core.core}</span>
          <span className="truncate flex-1">Core {core.core}</span>
          {isSelected && <Check className="h-4 w-4 shrink-0" />}
        </>
      )}
      footerContent={
        ctx?.currentPrice ? (
          <ContextHint
            text={`Current sale price: ${fromPlanck(ctx.currentPrice, tokenDenom)} ${tokenDenom.label}`}
          />
        ) : undefined
      }
    />
  );
}
