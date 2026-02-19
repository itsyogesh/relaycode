"use client";

import React, { useState, useMemo, type ReactNode } from "react";
import { ChevronsUpDown } from "lucide-react";
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

interface ContextComboboxProps<T> {
  items: T[];
  value: string | number | undefined;
  onChange?: (value: unknown) => void;
  label?: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  isContextLoading?: boolean;
  contextAvailable?: boolean;
  fallbackType?: "text" | "number";
  fallbackPlaceholder?: string;
  getItemValue: (item: T) => string | number;
  searchFilter: (item: T, query: string) => boolean;
  renderTriggerContent: (selectedItem: T) => ReactNode;
  renderItem: (item: T, isSelected: boolean) => ReactNode;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  maxItems?: number;
  triggerClassName?: string;
  itemClassName?: string;
}

export function ContextCombobox<T>({
  items,
  value,
  onChange,
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  isContextLoading,
  contextAvailable = true,
  fallbackType,
  fallbackPlaceholder,
  getItemValue,
  searchFilter,
  renderTriggerContent,
  renderItem,
  headerContent,
  footerContent,
  maxItems = 100,
  triggerClassName = "h-auto min-h-10 py-2",
  itemClassName = "flex flex-col items-start gap-0.5 py-2",
}: ContextComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => searchFilter(item, q));
  }, [items, search, searchFilter]);

  if (isContextLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!contextAvailable) {
    return (
      <SelectorFallback
        label={label}
        value={value}
        onChange={onChange}
        type={fallbackType}
        placeholder={fallbackPlaceholder}
      />
    );
  }

  const selected =
    value !== undefined && value !== null
      ? items.find((item) => String(getItemValue(item)) === String(value))
      : undefined;

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between ${triggerClassName}`}
          >
            {selected ? (
              renderTriggerContent(selected)
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
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
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            {headerContent}
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filtered.slice(0, maxItems).map((item) => {
                  const itemValue = getItemValue(item);
                  const isSelected = String(itemValue) === String(value);
                  return (
                    <CommandItem
                      key={String(itemValue)}
                      value={String(itemValue)}
                      onSelect={() => {
                        onChange?.(itemValue);
                        setOpen(false);
                      }}
                      className={itemClassName}
                    >
                      {renderItem(item, isSelected)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {footerContent}
    </div>
  );
}
