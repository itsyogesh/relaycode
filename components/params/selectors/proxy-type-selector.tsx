"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { ProxyContext } from "@/types/pallet-context";

export function ProxyTypeSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as ProxyContext | undefined;
  const proxyTypes = useMemo(() => ctx?.proxyTypes ?? [], [ctx?.proxyTypes]);

  return (
    <ContextCombobox
      items={proxyTypes}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select proxy type..."
      searchPlaceholder="Search proxy types..."
      emptyMessage="No proxy types found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && proxyTypes.length > 0}
      getItemValue={(t) => t.index}
      searchFilter={(t, q) =>
        t.name.toLowerCase().includes(q) || String(t.index).includes(q)
      }
      triggerClassName="h-10"
      itemClassName="flex items-center gap-2"
      renderTriggerContent={(selected) => (
        <span className="truncate">{selected.name}</span>
      )}
      renderItem={(proxyType, isSelected) => (
        <>
          <span className="font-mono text-xs shrink-0">{proxyType.index}</span>
          <span className="truncate flex-1">{proxyType.name}</span>
          {isSelected && <Check className="h-4 w-4 shrink-0" />}
        </>
      )}
    />
  );
}
