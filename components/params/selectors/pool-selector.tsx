"use client";

import React, { useState, useMemo } from "react";
import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { StakingContext } from "@/types/pallet-context";

function stateColor(state: string) {
  const s = state.toLowerCase();
  if (s === "open") return "bg-green-500/10 text-green-600 dark:text-green-400";
  if (s === "blocked")
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  if (s === "destroying")
    return "bg-red-500/10 text-red-600 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

export function PoolSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [showDestroying, setShowDestroying] = useState(false);

  const ctx = palletContext as StakingContext | undefined;
  const pools = useMemo(() => ctx?.pools ?? [], [ctx?.pools]);

  const displayPools = useMemo(() => {
    if (showDestroying) return pools;
    return pools.filter((p) => p.state.toLowerCase() !== "destroying");
  }, [pools, showDestroying]);

  return (
    <ContextCombobox
      items={displayPools}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select pool..."
      searchPlaceholder="Search pools..."
      emptyMessage="No pools found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && pools.length > 0}
      getItemValue={(p) => p.id}
      searchFilter={(p, q) =>
        String(p.id).includes(q) || p.name.toLowerCase().includes(q)
      }
      headerContent={
        <div className="flex items-center gap-2 px-2 py-1.5 border-b">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showDestroying}
              onChange={(e) => setShowDestroying(e.target.checked)}
              className="rounded"
            />
            Show destroying
          </label>
        </div>
      }
      renderTriggerContent={(selected) => (
        <div className="flex items-center gap-2 overflow-hidden text-left">
          <span className="font-mono text-xs shrink-0">#{selected.id}</span>
          <span className="truncate text-sm">{selected.name}</span>
          <Badge
            variant="secondary"
            className={cn(
              "shrink-0 text-[10px] px-1.5",
              stateColor(selected.state)
            )}
          >
            {selected.state}
          </Badge>
        </div>
      )}
      renderItem={(pool, isSelected) => (
        <>
          <div className="flex items-center gap-2 w-full">
            <span className="font-mono text-xs shrink-0">#{pool.id}</span>
            <span className="truncate text-sm flex-1">{pool.name}</span>
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-6">
            <Badge
              variant="secondary"
              className={cn("text-[10px] px-1 py-0", stateColor(pool.state))}
            >
              {pool.state}
            </Badge>
            <span className="flex items-center gap-0.5">
              <Users className="h-3 w-3" />
              {pool.memberCount} members
            </span>
            {pool.totalStake && <span>{pool.totalStake} staked</span>}
          </div>
        </>
      )}
    />
  );
}
