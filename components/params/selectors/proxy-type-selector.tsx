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
import { SelectorFallback } from "./selector-fallback";
import type { ParamInputProps } from "@/components/params/types";
import type { ProxyContext } from "@/types/pallet-context";

export function ProxyTypeSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ctx = palletContext as ProxyContext | undefined;
  const proxyTypes = useMemo(() => ctx?.proxyTypes ?? [], [ctx?.proxyTypes]);

  const filtered = useMemo(() => {
    if (!search.trim()) return proxyTypes;
    const q = search.toLowerCase();
    return proxyTypes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        String(t.index).includes(q)
    );
  }, [proxyTypes, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || proxyTypes.length === 0) {
    return <SelectorFallback label={label} value={value} onChange={onChange} />;
  }

  const selected = proxyTypes.find((t) => t.index === Number(value));

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
              <span className="truncate">{selected.name}</span>
            ) : (
              <span className="text-muted-foreground">Select proxy type...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search proxy types..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No proxy types found.</CommandEmpty>
              <CommandGroup>
                {filtered.map((proxyType) => (
                  <CommandItem
                    key={proxyType.index}
                    value={String(proxyType.index)}
                    onSelect={() => {
                      onChange?.(proxyType.index);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="font-mono text-xs shrink-0">
                      {proxyType.index}
                    </span>
                    <span className="truncate flex-1">{proxyType.name}</span>
                    {Number(value) === proxyType.index && (
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
