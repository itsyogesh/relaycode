"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Users } from "lucide-react";
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
import type { StakingContext } from "@/types/pallet-context";

function stateColor(state: string) {
  const s = state.toLowerCase();
  if (s === "open") return "bg-green-500/10 text-green-600 dark:text-green-400";
  if (s === "blocked") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  if (s === "destroying") return "bg-red-500/10 text-red-600 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

export function PoolSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showDestroying, setShowDestroying] = useState(false);

  const ctx = palletContext as StakingContext | undefined;
  const pools = useMemo(() => ctx?.pools ?? [], [ctx?.pools]);

  const filtered = useMemo(() => {
    let items = pools;
    if (!showDestroying) {
      items = items.filter((p) => p.state.toLowerCase() !== "destroying");
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          String(p.id).includes(q) ||
          p.name.toLowerCase().includes(q)
      );
    }
    return items;
  }, [pools, search, showDestroying]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || pools.length === 0) {
    return <SelectorFallback label={label} value={value} onChange={onChange} />;
  }

  const selected = pools.find((p) => p.id === Number(value));

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
                <span className="font-mono text-xs shrink-0">#{selected.id}</span>
                <span className="truncate text-sm">{selected.name}</span>
                <Badge variant="secondary" className={cn("shrink-0 text-[10px] px-1.5", stateColor(selected.state))}>
                  {selected.state}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">Select pool...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search pools..."
              value={search}
              onValueChange={setSearch}
            />
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
            <CommandList>
              <CommandEmpty>No pools found.</CommandEmpty>
              <CommandGroup>
                {filtered.map((pool) => (
                  <CommandItem
                    key={pool.id}
                    value={String(pool.id)}
                    onSelect={() => {
                      onChange?.(pool.id);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-mono text-xs shrink-0">#{pool.id}</span>
                      <span className="truncate text-sm flex-1">{pool.name}</span>
                      {Number(value) === pool.id && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-6">
                      <Badge variant="secondary" className={cn("text-[10px] px-1 py-0", stateColor(pool.state))}>
                        {pool.state}
                      </Badge>
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {pool.memberCount} members
                      </span>
                      {pool.totalStake && (
                        <span>{pool.totalStake} staked</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
