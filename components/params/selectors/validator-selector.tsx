"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, ShieldCheck } from "lucide-react";
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
import { truncateAddress } from "@/lib/pallet-context/utils";

export function ValidatorSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ctx = palletContext as StakingContext | undefined;
  const validators = useMemo(() => ctx?.validators ?? [], [ctx?.validators]);

  const sorted = useMemo(() => {
    const items = [...validators].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.commission - b.commission;
    });

    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (v) =>
        v.address.toLowerCase().includes(q) ||
        v.identity?.toLowerCase().includes(q)
    );
  }, [validators, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || validators.length === 0) {
    return (
      <SelectorFallback
        label={label}
        value={value}
        onChange={onChange}
        type="text"
        placeholder="Enter validator address"
      />
    );
  }

  const selected = validators.find((v) => v.address === value);

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
                {selected.isVerified && (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" />
                )}
                <span className="truncate text-sm">
                  {selected.identity || truncateAddress(selected.address)}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {selected.commission}%
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select validator...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search validators..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No validators found.</CommandEmpty>
              <CommandGroup>
                {sorted.slice(0, 100).map((v) => (
                  <CommandItem
                    key={v.address}
                    value={v.address}
                    onSelect={() => {
                      onChange?.(v.address);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 py-1.5"
                  >
                    {v.isVerified && (
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate text-sm">
                        {v.identity || truncateAddress(v.address)}
                      </span>
                      {v.identity && (
                        <span className="text-[11px] text-muted-foreground font-mono truncate">
                          {truncateAddress(v.address)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                      <span>{v.commission}%</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1 py-0",
                          v.isActive
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {v.isActive ? "Active" : "Waiting"}
                      </Badge>
                    </div>
                    {value === v.address && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
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
