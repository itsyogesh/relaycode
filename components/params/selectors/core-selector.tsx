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
import { Skeleton } from "@/components/ui/skeleton";
import { ContextHint } from "./context-hint";
import { SelectorFallback } from "./selector-fallback";
import type { ParamInputProps } from "@/components/params/types";
import type { CoretimeContext } from "@/types/pallet-context";
import { fromPlanck, type Denomination } from "@/lib/denominations";

export function CoreSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ctx = palletContext as CoretimeContext | undefined;
  const cores = useMemo(() => ctx?.cores ?? [], [ctx?.cores]);

  const tokenDenom: Denomination = useMemo(() => ({
    label: ctx?.tokenSymbol ?? "DOT",
    multiplier: BigInt(10) ** BigInt(ctx?.tokenDecimals ?? 10),
    maxDecimals: ctx?.tokenDecimals ?? 10,
  }), [ctx?.tokenSymbol, ctx?.tokenDecimals]);

  const filtered = useMemo(() => {
    if (!search.trim()) return cores;
    const q = search.toLowerCase();
    return cores.filter((c) => String(c.core).includes(q));
  }, [cores, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || cores.length === 0) {
    return <SelectorFallback label={label} value={value} onChange={onChange} />;
  }

  const selected = cores.find((c) => c.core === Number(value));

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10"
          >
            {selected ? (
              <span className="truncate">Core #{selected.core}</span>
            ) : (
              <span className="text-muted-foreground">Select core...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search cores..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No cores found.</CommandEmpty>
              <CommandGroup>
                {filtered.map((core) => (
                  <CommandItem
                    key={core.core}
                    value={String(core.core)}
                    onSelect={() => {
                      onChange?.(core.core);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="font-mono text-xs shrink-0">
                      #{core.core}
                    </span>
                    <span className="truncate flex-1">Core {core.core}</span>
                    {Number(value) === core.core && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {ctx.currentPrice && (
        <ContextHint
          text={`Current sale price: ${fromPlanck(ctx.currentPrice, tokenDenom)} ${tokenDenom.label}`}
        />
      )}
    </div>
  );
}
