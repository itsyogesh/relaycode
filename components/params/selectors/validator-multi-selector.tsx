"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, ShieldCheck, X } from "lucide-react";
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
import type { StakingContext, ValidatorInfo } from "@/types/pallet-context";
import { truncateAddress } from "@/lib/pallet-context/utils";

const MAX_NOMINATIONS = 16;

export function ValidatorMultiSelector({
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
  const selected: string[] = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value]
  );

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

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleValidator = (address: string) => {
    if (selectedSet.has(address)) {
      onChange?.(selected.filter((a) => a !== address));
    } else if (selected.length < MAX_NOMINATIONS) {
      onChange?.([...selected, address]);
    }
  };

  const removeValidator = (address: string) => {
    onChange?.(selected.filter((a) => a !== address));
  };

  const getValidatorInfo = (address: string): ValidatorInfo | undefined => {
    return validators.find((v) => v.address === address);
  };

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
        placeholder="Enter validator addresses (comma-separated)"
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Badge variant="secondary" className="text-xs">
          {selected.length}/{MAX_NOMINATIONS} selected
        </Badge>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10"
          >
            <span className="text-muted-foreground">
              {selected.length > 0
                ? `${selected.length} validator${selected.length > 1 ? "s" : ""} selected`
                : "Select validators..."}
            </span>
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
                {sorted.slice(0, 100).map((v) => {
                  const isSelected = selectedSet.has(v.address);
                  const atLimit = selected.length >= MAX_NOMINATIONS && !isSelected;

                  return (
                    <CommandItem
                      key={v.address}
                      value={v.address}
                      onSelect={() => toggleValidator(v.address)}
                      className={cn(
                        "flex items-center gap-2 py-1.5",
                        atLimit && "opacity-50"
                      )}
                      disabled={atLimit}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded border shrink-0 flex items-center justify-center",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      {v.isVerified && (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate text-sm">
                          {v.identity || truncateAddress(v.address)}
                        </span>
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
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected validators as removable chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((addr) => {
            const info = getValidatorInfo(addr);
            return (
              <Badge
                key={addr}
                variant="secondary"
                className="flex items-center gap-1 pl-2 pr-1 py-1"
              >
                {info?.isVerified && (
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                )}
                <span className="text-xs truncate max-w-[150px]">
                  {info?.identity || truncateAddress(addr, 4)}
                </span>
                <button
                  type="button"
                  onClick={() => removeValidator(addr)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
