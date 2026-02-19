"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { GovernanceContext } from "@/types/pallet-context";

export function TrackSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const ctx = palletContext as GovernanceContext | undefined;
  const tracks = useMemo(() => ctx?.tracks ?? [], [ctx?.tracks]);

  return (
    <ContextCombobox
      items={tracks}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select track..."
      searchPlaceholder="Search tracks..."
      emptyMessage="No tracks found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && tracks.length > 0}
      getItemValue={(t) => t.id}
      searchFilter={(t, q) =>
        String(t.id).includes(q) || t.name.toLowerCase().includes(q)
      }
      triggerClassName="h-10"
      itemClassName="flex items-center gap-2"
      renderTriggerContent={(selected) => (
        <span className="truncate">
          #{selected.id} {selected.name}
        </span>
      )}
      renderItem={(track, isSelected) => (
        <>
          <span className="font-mono text-xs shrink-0">#{track.id}</span>
          <span className="truncate flex-1">{track.name}</span>
          {track.maxDeciding && (
            <span className="text-xs text-muted-foreground shrink-0">
              {track.currentDeciding ?? "?"}/{track.maxDeciding} deciding
            </span>
          )}
          {isSelected && <Check className="h-4 w-4 shrink-0" />}
        </>
      )}
    />
  );
}
