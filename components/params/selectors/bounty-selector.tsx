"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { GovernanceContext } from "@/types/pallet-context";
import { truncateAddress } from "@/lib/pallet-context/utils";
import { fromPlanck, type Denomination } from "@/lib/denominations";

export function BountySelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as GovernanceContext | undefined;
  const bounties = useMemo(() => ctx?.bounties ?? [], [ctx?.bounties]);
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
      items={bounties}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select bounty..."
      searchPlaceholder="Search bounties..."
      emptyMessage="No bounties found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && bounties.length > 0}
      getItemValue={(b) => b.index}
      searchFilter={(b, q) =>
        String(b.index).includes(q) ||
        !!b.title?.toLowerCase().includes(q) ||
        !!b.description?.toLowerCase().includes(q) ||
        !!b.curator?.toLowerCase().includes(q)
      }
      renderTriggerContent={(selected) => (
        <div className="flex items-center gap-2 overflow-hidden text-left">
          <span className="font-mono text-xs shrink-0">#{selected.index}</span>
          <span className="truncate text-sm">
            {selected.title || selected.description?.slice(0, 60) || "Untitled"}
          </span>
        </div>
      )}
      renderItem={(bounty, isSelected) => (
        <>
          <div className="flex items-center gap-2 w-full">
            <span className="font-mono text-xs shrink-0">#{bounty.index}</span>
            <span className="truncate text-sm flex-1">
              {bounty.title || bounty.description?.slice(0, 60) || "Untitled"}
            </span>
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-6">
            {bounty.value && (
              <span>
                {fromPlanck(bounty.value, tokenDenom)} {tokenDenom.label}
              </span>
            )}
            {bounty.curator && (
              <span>
                Curator:{" "}
                {bounty.curatorIdentity || truncateAddress(bounty.curator)}
              </span>
            )}
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              {bounty.status}
            </Badge>
          </div>
        </>
      )}
    />
  );
}
