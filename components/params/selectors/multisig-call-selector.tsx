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
import type { MultisigContext } from "@/types/pallet-context";
import { truncateAddress } from "@/lib/pallet-context/utils";

export function MultisigCallSelector({
  label,
  value,
  onChange,
  isContextLoading,
  palletContext,
}: ParamInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ctx = palletContext as MultisigContext | undefined;
  const multisigs = useMemo(
    () => ctx?.pendingMultisigs ?? [],
    [ctx?.pendingMultisigs]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return multisigs;
    const q = search.toLowerCase();
    return multisigs.filter(
      (m) =>
        m.callHash.toLowerCase().includes(q) ||
        m.depositor.toLowerCase().includes(q)
    );
  }, [multisigs, search]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!ctx || multisigs.length === 0) {
    return (
      <SelectorFallback
        label={label}
        value={value}
        onChange={onChange}
        type="text"
        placeholder="Enter call hash (0x...)"
      />
    );
  }

  const selected = multisigs.find((m) => m.callHash === value);

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
                <span className="font-mono text-xs truncate">
                  {truncateAddress(selected.callHash, 8)}
                </span>
                <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5">
                  {selected.approvals.length}/{selected.threshold}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">
                Select pending multisig...
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
              placeholder="Search by call hash..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No pending multisigs found.</CommandEmpty>
              <CommandGroup>
                {filtered.map((msig) => (
                  <CommandItem
                    key={msig.callHash}
                    value={msig.callHash}
                    onSelect={() => {
                      onChange?.(msig.callHash);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-mono text-xs truncate flex-1">
                        {truncateAddress(msig.callHash, 8)}
                      </span>
                      {value === msig.callHash && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {msig.approvals.length}/{msig.threshold} approvals
                      </Badge>
                      <span>
                        Block #{msig.when.height}
                      </span>
                      <span>
                        By: {truncateAddress(msig.depositor)}
                      </span>
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
