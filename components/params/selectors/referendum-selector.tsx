"use client";

import React, { useState, useMemo } from "react";
import { Check, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContextCombobox } from "./context-combobox";
import type { ParamInputProps } from "@/components/params/types";
import type { GovernanceContext, ReferendumInfo } from "@/types/pallet-context";

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes("confirm") || s.includes("deciding"))
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  if (s.includes("approved") || s.includes("executed"))
    return "bg-green-500/10 text-green-600 dark:text-green-400";
  if (
    s.includes("rejected") ||
    s.includes("cancelled") ||
    s.includes("killed") ||
    s.includes("timed")
  )
    return "bg-red-500/10 text-red-600 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

function formatTallyPercent(tally?: ReferendumInfo["tally"]): string | null {
  if (!tally) return null;
  const ayes = BigInt(tally.ayes || "0");
  const nays = BigInt(tally.nays || "0");
  const total = ayes + nays;
  if (total === BigInt(0)) return "0%";
  return `${((Number(ayes) / Number(total)) * 100).toFixed(1)}%`;
}

export function ReferendumSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [filter, setFilter] = useState<"active" | "all">("active");

  const ctx = palletContext as GovernanceContext | undefined;
  const referenda = useMemo(() => ctx?.referenda ?? [], [ctx?.referenda]);

  const displayReferenda = useMemo(() => {
    if (filter === "all") return referenda;
    return referenda.filter((r) => {
      const s = r.status.toLowerCase();
      return (
        s.includes("deciding") ||
        s.includes("confirm") ||
        s.includes("ongoing") ||
        s.includes("submitted")
      );
    });
  }, [referenda, filter]);

  return (
    <ContextCombobox
      items={displayReferenda}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select referendum..."
      searchPlaceholder="Search by index, title, or track..."
      emptyMessage="No referenda found."
      isContextLoading={isContextLoading}
      contextAvailable={!!ctx && referenda.length > 0}
      getItemValue={(r) => r.index}
      searchFilter={(r, q) =>
        String(r.index).includes(q) ||
        !!r.title?.toLowerCase().includes(q) ||
        !!r.trackName?.toLowerCase().includes(q)
      }
      headerContent={
        <div className="flex gap-1 px-2 py-1.5 border-b">
          <Button
            variant={filter === "active" ? "secondary" : "ghost"}
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>
      }
      renderTriggerContent={(selected) => (
        <div className="flex items-center gap-2 overflow-hidden text-left">
          <span className="font-mono text-xs shrink-0">#{selected.index}</span>
          <span className="truncate text-sm">
            {selected.title || "Untitled"}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "shrink-0 text-[10px] px-1.5",
              statusColor(selected.status)
            )}
          >
            {selected.status}
          </Badge>
        </div>
      )}
      renderItem={(ref, isSelected) => {
        const ayePercent = formatTallyPercent(ref.tally);
        return (
          <>
            <div className="flex items-center gap-2 w-full">
              <span className="font-mono text-xs shrink-0">#{ref.index}</span>
              <span className="truncate text-sm flex-1">
                {ref.title || "Untitled"}
              </span>
              {isSelected && <Check className="h-4 w-4 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-6">
              {ref.trackName && <span>Track: {ref.trackName}</span>}
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1 py-0",
                  statusColor(ref.status)
                )}
              >
                {ref.status}
              </Badge>
              {ayePercent && (
                <span className="flex items-center gap-0.5">
                  <Vote className="h-3 w-3" />
                  Ayes: {ayePercent}
                </span>
              )}
            </div>
          </>
        );
      }}
    />
  );
}
