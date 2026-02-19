"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { XcmContext } from "@/types/pallet-context";

export function DestinationChainSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as XcmContext | undefined;
  const parachains = useMemo(() => ctx?.parachains ?? [], [ctx?.parachains]);

  return (
    <ContextCombobox
      items={parachains}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select destination chain..."
      searchPlaceholder="Search by name or parachain ID..."
      emptyMessage="No chains found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && parachains.length > 0}
      fallbackPlaceholder="Enter parachain ID"
      getItemValue={(p) => p.paraId}
      searchFilter={(p, q) =>
        p.name.toLowerCase().includes(q) || String(p.paraId).includes(q)
      }
      itemClassName="flex items-center gap-2"
      renderTriggerContent={(selected) => (
        <div className="flex items-center gap-2 overflow-hidden text-left">
          <span className="font-mono text-xs shrink-0">{selected.paraId}</span>
          <span className="truncate text-sm">{selected.name}</span>
        </div>
      )}
      renderItem={(chain, isSelected) => {
        const isSystem = chain.paraId < 2000;
        return (
          <>
            <span className="font-mono text-xs shrink-0">{chain.paraId}</span>
            <span className="truncate flex-1">{chain.name}</span>
            {isSystem && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              >
                System
              </Badge>
            )}
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
          </>
        );
      }}
    />
  );
}
