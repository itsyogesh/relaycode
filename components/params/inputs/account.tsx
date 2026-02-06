"use client";

import React, { useMemo, useCallback } from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { AccountCombobox, type AccountOption } from "./account-combobox";
import { useSS58 } from "@/hooks/use-ss58";
import { useRecentAddresses } from "@/hooks/use-recent-addresses";
import { decodeAddress } from "dedot/utils";
import type { ParamInputProps } from "../types";

import { useSafeAccounts } from "@/hooks/use-wallet-safe";

const schema = z.string().refine(
  (value) => {
    try {
      decodeAddress(value);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: "Invalid Substrate address",
  }
);

export function Account({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  client,
  onChange,
  value: externalValue,
}: ParamInputProps) {
  const { accounts } = useSafeAccounts();
  const { recentAddresses, addRecent } = useRecentAddresses();
  const { ss58Prefix, formatAddress, isValidAddress, truncateAddress } =
    useSS58(client ?? null);

  // Convert LunoKit accounts to AccountOption format
  const accountOptions: AccountOption[] = useMemo(() => {
    return accounts.map((acc) => ({
      address: acc.address,
      name: acc.name,
    }));
  }, [accounts]);

  // Extract just the addresses from recent
  const recentAddressList = useMemo(() => {
    return recentAddresses.map((r) => r.address);
  }, [recentAddresses]);

  // Track current value (internal state for the combobox)
  const [value, setValue] = React.useState<string | undefined>(undefined);

  // Sync from external value (e.g., hex decode setting form value)
  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== null && externalValue !== "") {
      const extStr = String(externalValue);
      if (extStr !== value) {
        setValue(extStr);
      }
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback(
    (address: string | undefined) => {
      setValue(address);

      if (!address) {
        onChange?.(undefined);
        return;
      }

      // Format to chain prefix before passing up
      const formatted = formatAddress(address);
      if (formatted) {
        onChange?.(formatted);

        // Add to recent if it's not from connected accounts
        const isConnectedAccount = accounts.some((acc) => {
          const accFormatted = formatAddress(acc.address);
          return accFormatted === formatted;
        });

        if (!isConnectedAccount) {
          addRecent(address);
        }
      }
    },
    [onChange, formatAddress, accounts, addRecent]
  );

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <AccountCombobox
        value={value}
        onChange={handleChange}
        accounts={accountOptions}
        recentAddresses={recentAddressList}
        ss58Prefix={ss58Prefix}
        formatAddress={formatAddress}
        isValidAddress={isValidAddress}
        truncateAddress={truncateAddress}
        disabled={isDisabled}
        placeholder="Select or paste an account..."
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Account.schema = schema;
