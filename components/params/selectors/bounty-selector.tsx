"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ctx = palletContext as GovernanceContext | undefined;
  const bounties = useMemo(() => ctx?.bounties ?? [], [ctx?.bounties]);
  const tokenDenom: Denomination = useMemo(() => ({
    label: ctx?.tokenSymbol ?? "DOT",
    multiplier: BigInt(10) ** BigInt(ctx?.tokenDecimals ?? 10),
    maxDecimals: ctx?.tokenDecimals ?? 10,
  }), [ctx?.tokenSymbol, ctx?.tokenDecimals]);

  const filtered = useMemo(() => {
    if (!search.trim()) return bounties;
    const q = search.toLowerCase();
    return bounties.filter(
      (b) =>
        String(b.index).includes(q) ||
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.curator?.toLowerCase().includes(q)
    );
  }, [bounties, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || bounties.length === 0) {
    return <SelectorFallback label={label} value={value} onChange={onChange} />;
  }

  const selected = bounties.find((b) => b.index === Number(value));

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
                  {selected.title || selected.description?.slice(0, 60) || "Untitled"}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select bounty...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search bounties..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No bounties found.</CommandEmpty>
              <CommandGroup>
                {filtered.map((bounty) => (
                  <CommandItem
                    key={bounty.index}
                    value={String(bounty.index)}
                    onSelect={() => {
                      onChange?.(bounty.index);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-mono text-xs shrink-0">#{bounty.index}</span>
                      <span className="truncate text-sm flex-1">
                        {bounty.title || bounty.description?.slice(0, 60) || "Untitled"}
                      </span>
                      {Number(value) === bounty.index && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-6">
                      {bounty.value && <span>{fromPlanck(bounty.value, tokenDenom)} {tokenDenom.label}</span>}
                      {bounty.curator && (
                        <span>
                          Curator: {bounty.curatorIdentity || truncateAddress(bounty.curator)}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {bounty.status}
                      </Badge>
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
