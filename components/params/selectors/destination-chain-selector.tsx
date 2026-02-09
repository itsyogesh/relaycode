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
import type { XcmContext } from "@/types/pallet-context";

export function DestinationChainSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ctx = palletContext as XcmContext | undefined;
  const parachains = useMemo(() => ctx?.parachains ?? [], [ctx?.parachains]);

  const filtered = useMemo(() => {
    if (!search.trim()) return parachains;
    const q = search.toLowerCase();
    return parachains.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.paraId).includes(q)
    );
  }, [parachains, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || parachains.length === 0) {
    return (
      <SelectorFallback
        label={label}
        value={value}
        onChange={onChange}
        placeholder="Enter parachain ID"
      />
    );
  }

  const selected = parachains.find((p) => p.paraId === Number(value));

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
                <span className="font-mono text-xs shrink-0">
                  {selected.paraId}
                </span>
                <span className="truncate text-sm">{selected.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                Select destination chain...
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by name or parachain ID..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No chains found.</CommandEmpty>
              <CommandGroup>
                {filtered.map((chain) => {
                  const isSystem = chain.paraId < 2000;
                  return (
                    <CommandItem
                      key={chain.paraId}
                      value={String(chain.paraId)}
                      onSelect={() => {
                        onChange?.(chain.paraId);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <span className="font-mono text-xs shrink-0">
                        {chain.paraId}
                      </span>
                      <span className="truncate flex-1">{chain.name}</span>
                      {isSystem && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        >
                          System
                        </Badge>
                      )}
                      {Number(value) === chain.paraId && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
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
