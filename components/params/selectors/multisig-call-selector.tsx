"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { MultisigContext } from "@/types/pallet-context";
import { truncateAddress } from "@/lib/pallet-context/utils";

export function MultisigCallSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as MultisigContext | undefined;
  const multisigs = useMemo(
    () => ctx?.pendingMultisigs ?? [],
    [ctx?.pendingMultisigs]
  );

  return (
    <ContextCombobox
      items={multisigs}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select pending multisig..."
      searchPlaceholder="Search by call hash..."
      emptyMessage="No pending multisigs found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && multisigs.length > 0}
      fallbackType="text"
      fallbackPlaceholder="Enter call hash (0x...)"
      getItemValue={(m) => m.callHash}
      searchFilter={(m, q) =>
        m.callHash.toLowerCase().includes(q) ||
        m.depositor.toLowerCase().includes(q)
      }
      renderTriggerContent={(selected) => (
        <div className="flex items-center gap-2 overflow-hidden text-left">
          <span className="font-mono text-xs truncate">
            {truncateAddress(selected.callHash, 8)}
          </span>
          <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5">
            {selected.approvals.length}/{selected.threshold}
          </Badge>
        </div>
      )}
      renderItem={(msig, isSelected) => (
        <>
          <div className="flex items-center gap-2 w-full">
            <span className="font-mono text-xs truncate flex-1">
              {truncateAddress(msig.callHash, 8)}
            </span>
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              {msig.approvals.length}/{msig.threshold} approvals
            </Badge>
            <span>Block #{msig.when.height}</span>
            <span>By: {truncateAddress(msig.depositor)}</span>
          </div>
        </>
      )}
    />
  );
}
