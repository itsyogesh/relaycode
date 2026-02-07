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
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Identicon } from "@/components/ui/identicon";

export interface AccountOption {
  address: string;
  name?: string;
}

interface AccountComboboxProps {
  value?: string;
  onChange: (address: string | undefined) => void;
  accounts: AccountOption[];
  recentAddresses: string[];
  ss58Prefix: number;
  formatAddress: (addr: string) => string | null;
  isValidAddress: (addr: string) => boolean;
  truncateAddress: (addr: string) => string;
  disabled?: boolean;
  placeholder?: string;
}

export function AccountCombobox({
  value,
  onChange,
  accounts,
  recentAddresses,
  formatAddress,
  isValidAddress,
  truncateAddress,
  disabled,
  placeholder = "Select an account...",
}: AccountComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pasteConfirmed, setPasteConfirmed] = useState(false);

  // Format value for display
  const displayValue = useMemo(() => {
    if (!value) return null;
    return formatAddress(value) ?? value;
  }, [value, formatAddress]);

  // Format accounts with chain prefix
  const formattedAccounts = useMemo(() => {
    return accounts.map((acc) => ({
      ...acc,
      formattedAddress: formatAddress(acc.address) ?? acc.address,
    }));
  }, [accounts, formatAddress]);

  // Format recent addresses with chain prefix, excluding any that match connected accounts
  const formattedRecent = useMemo(() => {
    const accountAddresses = new Set(
      formattedAccounts.map((a) => a.formattedAddress)
    );
    return recentAddresses
      .map((addr) => formatAddress(addr) ?? addr)
      .filter((addr) => !accountAddresses.has(addr));
  }, [recentAddresses, formattedAccounts, formatAddress]);

  // Check if typed value is a valid address not in any list
  const typedAddress = useMemo(() => {
    if (!search.trim()) return null;
    if (!isValidAddress(search)) return null;

    const formatted = formatAddress(search);
    if (!formatted) return null;

    // Check if it matches any connected account
    const inAccounts = formattedAccounts.some(
      (a) => a.formattedAddress === formatted
    );
    if (inAccounts) return null;

    // Check if it matches any recent address
    const inRecent = formattedRecent.includes(formatted);
    if (inRecent) return null;

    return formatted;
  }, [search, isValidAddress, formatAddress, formattedAccounts, formattedRecent]);

  const handleSelect = (address: string) => {
    onChange(address);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange(undefined);
    setSearch("");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text");
    // Strip surrounding quotes and whitespace
    const cleaned = pasted.trim().replace(/^["']|["']$/g, "").trim();
    if (cleaned && isValidAddress(cleaned)) {
      e.preventDefault();
      const formatted = formatAddress(cleaned);
      if (formatted) {
        onChange(formatted);
        setOpen(false);
        setSearch("");
        setPasteConfirmed(true);
        setTimeout(() => setPasteConfirmed(false), 2000);
      }
    }
  };

  // Find name for currently selected value
  const selectedAccount = formattedAccounts.find(
    (a) => a.formattedAddress === displayValue
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-mono h-10"
        >
          {displayValue ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <Identicon address={displayValue} size={20} className="shrink-0" />
              <span className="truncate">
                {selectedAccount?.name
                  ? `${selectedAccount.name} (${truncateAddress(displayValue)})`
                  : truncateAddress(displayValue)}
              </span>
              {pasteConfirmed && (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              )}
            </div>
          ) : (
            <span className="text-muted-foreground font-normal">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or paste address..."
            value={search}
            onValueChange={setSearch}
            onPaste={handlePaste}
          />
          <CommandList>
            {formattedAccounts.length === 0 &&
              formattedRecent.length === 0 &&
              !typedAddress && (
                <CommandEmpty>
                  {search.trim()
                    ? "Invalid address format"
                    : "No accounts available"}
                </CommandEmpty>
              )}

            {/* Connected wallet accounts */}
            {formattedAccounts.length > 0 && (
              <CommandGroup heading="My Accounts">
                {formattedAccounts
                  .filter(
                    (acc) =>
                      !search.trim() ||
                      acc.formattedAddress
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      acc.name?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((acc) => (
                    <CommandItem
                      key={acc.formattedAddress}
                      value={acc.formattedAddress}
                      onSelect={() => handleSelect(acc.formattedAddress)}
                      className="flex items-center gap-2"
                    >
                      <Identicon
                        address={acc.formattedAddress}
                        size={24}
                        className="shrink-0"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        {acc.name && (
                          <span className="text-sm font-medium truncate">
                            {acc.name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground font-mono truncate">
                          {truncateAddress(acc.formattedAddress)}
                        </span>
                      </div>
                      {displayValue === acc.formattedAddress && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {/* Separator between groups */}
            {formattedAccounts.length > 0 && formattedRecent.length > 0 && (
              <CommandSeparator />
            )}

            {/* Recently used addresses */}
            {formattedRecent.length > 0 && (
              <CommandGroup heading="Recently Used">
                {formattedRecent
                  .filter(
                    (addr) =>
                      !search.trim() ||
                      addr.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((addr) => (
                    <CommandItem
                      key={addr}
                      value={addr}
                      onSelect={() => handleSelect(addr)}
                      className="flex items-center gap-2"
                    >
                      <Identicon address={addr} size={24} className="shrink-0" />
                      <span className="text-xs font-mono truncate flex-1">
                        {truncateAddress(addr)}
                      </span>
                      {displayValue === addr && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {/* Typed address option */}
            {typedAddress && (
              <>
                {(formattedAccounts.length > 0 ||
                  formattedRecent.length > 0) && <CommandSeparator />}
                <CommandGroup>
                  <CommandItem
                    value={typedAddress}
                    onSelect={() => handleSelect(typedAddress)}
                    className="flex items-center gap-2"
                  >
                    <Identicon
                      address={typedAddress}
                      size={24}
                      className="shrink-0"
                    />
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <span className="text-sm">Use:</span>
                      <span className="text-xs font-mono truncate">
                        {truncateAddress(typedAddress)}
                      </span>
                    </div>
                    <Check className="h-4 w-4 shrink-0 opacity-0" />
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {/* Clear option when value is set */}
            {displayValue && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="text-muted-foreground"
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
