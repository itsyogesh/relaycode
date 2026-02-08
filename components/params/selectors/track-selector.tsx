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
import type { GovernanceContext } from "@/types/pallet-context";

export function TrackSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ctx = palletContext as GovernanceContext | undefined;
  const tracks = useMemo(() => ctx?.tracks ?? [], [ctx?.tracks]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tracks;
    const q = search.toLowerCase();
    return tracks.filter(
      (t) =>
        String(t.id).includes(q) ||
        t.name.toLowerCase().includes(q)
    );
  }, [tracks, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || tracks.length === 0) {
    return <SelectorFallback label={label} value={value} onChange={onChange} />;
  }

  const selected = tracks.find((t) => t.id === Number(value));

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
              <span className="truncate">
                #{selected.id} {selected.name}
              </span>
            ) : (
              <span className="text-muted-foreground">Select track...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search tracks..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No tracks found.</CommandEmpty>
              <CommandGroup>
                {filtered.map((track) => (
                  <CommandItem
                    key={track.id}
                    value={String(track.id)}
                    onSelect={() => {
                      onChange?.(track.id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="font-mono text-xs shrink-0">#{track.id}</span>
                    <span className="truncate flex-1">{track.name}</span>
                    {track.maxDeciding && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {track.currentDeciding ?? "?"}/{track.maxDeciding} deciding
                      </span>
                    )}
                    {Number(value) === track.id && (
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
