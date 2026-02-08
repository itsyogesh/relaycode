"use client";

import React, { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
  AccountCombobox,
  type AccountOption,
} from "@/components/params/inputs/account-combobox";
import { encodeAddress, decodeAddress } from "dedot/utils";

const SS58_PREFIX = 0; // Polkadot

const DEMO_ACCOUNTS: AccountOption[] = [
  { address: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqWrztPu6BsCNqHXSSR", name: "Alice" },
  { address: "14E5nqKAp3oAJcg6bNbGNMftfM7DqE1RK3v8cPmiv8gdGTYe", name: "Bob" },
  { address: "13UVJyLnbVp77Z2t6qZP4toyodigy3RVxCqLg8cEmFQtvCnB", name: "Charlie" },
];

const RECENT_ADDRESSES = [
  "16ZL8yLg6tiiYvqFCyS3FLNyGsX7u8XfXfNwiiNRU6hNBQKH",
];

function formatAddress(addr: string): string | null {
  try {
    const pubkey = decodeAddress(addr);
    return encodeAddress(pubkey, SS58_PREFIX);
  } catch {
    return null;
  }
}

function isValidAddress(addr: string): boolean {
  try {
    decodeAddress(addr);
    return true;
  } catch {
    return false;
  }
}

function truncateAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

export function AccountDemo() {
  const [value, setValue] = useState<string | undefined>();

  const handleChange = useCallback((addr: string | undefined) => {
    setValue(addr);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <Label>Destination</Label>
      <AccountCombobox
        value={value}
        onChange={handleChange}
        accounts={DEMO_ACCOUNTS}
        recentAddresses={RECENT_ADDRESSES}
        ss58Prefix={SS58_PREFIX}
        formatAddress={formatAddress}
        isValidAddress={isValidAddress}
        truncateAddress={truncateAddress}
        placeholder="Select an account..."
      />
    </div>
  );
}
