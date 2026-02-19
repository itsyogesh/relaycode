"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { AssetsContext } from "@/types/pallet-context";

export function AssetSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as AssetsContext | undefined;
  const assets = useMemo(() => ctx?.assets ?? [], [ctx?.assets]);

  return (
    <ContextCombobox
      items={assets}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select asset..."
      searchPlaceholder="Search by ID, name, or symbol..."
      emptyMessage="No assets found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && assets.length > 0}
      getItemValue={(a) => a.id}
      searchFilter={(a, q) =>
        String(a.id).includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.symbol.toLowerCase().includes(q)
      }
      renderTriggerContent={(selected) => (
        <div className="flex items-center gap-2 overflow-hidden text-left">
          <span className="font-mono text-xs shrink-0">#{selected.id}</span>
          <span className="truncate text-sm">{selected.name}</span>
          {selected.symbol && (
            <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5">
              {selected.symbol}
            </Badge>
          )}
        </div>
      )}
      renderItem={(asset, isSelected) => (
        <>
          <div className="flex items-center gap-2 w-full">
            <span className="font-mono text-xs shrink-0">#{asset.id}</span>
            <span className="truncate text-sm flex-1">{asset.name}</span>
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-6">
            {asset.symbol && <span>{asset.symbol}</span>}
            <span>{asset.decimals} decimals</span>
            {asset.isFrozen && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              >
                Frozen
              </Badge>
            )}
          </div>
        </>
      )}
    />
  );
}
