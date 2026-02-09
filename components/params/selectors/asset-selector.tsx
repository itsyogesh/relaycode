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
import type { AssetsContext } from "@/types/pallet-context";

export function AssetSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ctx = palletContext as AssetsContext | undefined;
  const assets = useMemo(() => ctx?.assets ?? [], [ctx?.assets]);

  const filtered = useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        String(a.id).includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.symbol.toLowerCase().includes(q)
    );
  }, [assets, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || assets.length === 0) {
    return <SelectorFallback label={label} value={value} onChange={onChange} />;
  }

  const selected = assets.find((a) => a.id === Number(value));

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
                {selected.symbol && (
                  <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5">
                    {selected.symbol}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Select asset...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by ID, name, or symbol..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No assets found.</CommandEmpty>
              <CommandGroup>
                {filtered.slice(0, 100).map((asset) => (
                  <CommandItem
                    key={asset.id}
                    value={String(asset.id)}
                    onSelect={() => {
                      onChange?.(asset.id);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-mono text-xs shrink-0">#{asset.id}</span>
                      <span className="truncate text-sm flex-1">{asset.name}</span>
                      {Number(value) === asset.id && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
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
