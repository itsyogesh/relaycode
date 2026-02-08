"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectorFallback } from "./selector-fallback";
import type { ParamInputProps } from "@/components/params/types";
import type { GovernanceContext, ReferendumInfo } from "@/types/pallet-context";

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes("confirm") || s.includes("deciding")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  if (s.includes("approved") || s.includes("executed")) return "bg-green-500/10 text-green-600 dark:text-green-400";
  if (s.includes("rejected") || s.includes("cancelled") || s.includes("killed") || s.includes("timed")) return "bg-red-500/10 text-red-600 dark:text-red-400";
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "all">("active");

  const ctx = palletContext as GovernanceContext | undefined;
  const referenda = useMemo(() => ctx?.referenda ?? [], [ctx?.referenda]);

  const filteredReferenda = useMemo(() => {
    let items = referenda;
    if (filter === "active") {
      items = items.filter((r) => {
        const s = r.status.toLowerCase();
        return s.includes("deciding") || s.includes("confirm") || s.includes("ongoing") || s.includes("submitted");
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          String(r.index).includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.trackName?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [referenda, filter, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || referenda.length === 0) {
    return <SelectorFallback label={label} value={value} onChange={onChange} />;
  }

  const selected = referenda.find((r) => r.index === Number(value));

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            {selected ? (
              <div className="flex items-center gap-2 overflow-hidden text-left">
                <span className="font-mono text-xs shrink-0">#{selected.index}</span>
                <span className="truncate text-sm">
                  {selected.title || "Untitled"}
                </span>
                <Badge variant="secondary" className={cn("shrink-0 text-[10px] px-1.5", statusColor(selected.status))}>
                  {selected.status}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">Select referendum...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by index, title, or track..."
              value={search}
              onValueChange={setSearch}
            />
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
            <CommandList>
              <CommandEmpty>No referenda found.</CommandEmpty>
              <CommandGroup>
                {filteredReferenda.map((ref) => {
                  const ayePercent = formatTallyPercent(ref.tally);
                  return (
                    <CommandItem
                      key={ref.index}
                      value={String(ref.index)}
                      onSelect={() => {
                        onChange?.(ref.index);
                        setOpen(false);
                      }}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-mono text-xs shrink-0">#{ref.index}</span>
                        <span className="truncate text-sm flex-1">
                          {ref.title || "Untitled"}
                        </span>
                        {Number(value) === ref.index && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-6">
                        {ref.trackName && <span>Track: {ref.trackName}</span>}
                        <Badge variant="secondary" className={cn("text-[10px] px-1 py-0", statusColor(ref.status))}>
                          {ref.status}
                        </Badge>
                        {ayePercent && (
                          <span className="flex items-center gap-0.5">
                            <Vote className="h-3 w-3" />
                            Ayes: {ayePercent}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
