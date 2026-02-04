"use client";

import { useAccount, useAccounts, useBalance } from "@luno-kit/react";
import { useLunoKitAvailable } from "@/components/wallet/wallet-provider";

// Types matching what the components expect
interface AccountResult {
  address?: string;
}

interface AccountsResult {
  accounts: Array<{ address: string; name?: string }>;
}

interface BalanceData {
  free?: bigint;
  transferable?: bigint;
  formattedTransferable?: string;
}

// Default/fallback values
const defaultAccount: AccountResult = { address: undefined };
const defaultAccounts: AccountsResult = { accounts: [] };
const defaultBalance: BalanceData = {
  free: undefined,
  transferable: undefined,
  formattedTransferable: undefined,
};

/**
 * Safe wrapper for useAccount - returns default values if provider not ready
 */
export function useSafeAccount(): AccountResult {
  const isAvailable = useLunoKitAvailable();
  // Always call the hook to satisfy Rules of Hooks
  const accountResult = useAccount();

  if (!isAvailable) {
    return defaultAccount;
  }

  // Extract address from the account object
  return { address: accountResult.account?.address };
}

/**
 * Safe wrapper for useAccounts - returns empty accounts if provider not ready
 */
export function useSafeAccounts(): AccountsResult {
  const isAvailable = useLunoKitAvailable();
  // Always call the hook to satisfy Rules of Hooks
  const accountsResult = useAccounts();

  if (!isAvailable) {
    return defaultAccounts;
  }

  return accountsResult;
}

/**
 * Safe wrapper for useBalance - extracts data and returns flattened result
 */
export function useSafeBalance(opts: { address?: string }): BalanceData {
  const isAvailable = useLunoKitAvailable();
  // Always call the hook to satisfy Rules of Hooks
  const balanceResult = useBalance(opts);

  if (!isAvailable || !balanceResult.data) {
    return defaultBalance;
  }

  // Extract the balance data from the subscription result
  return {
    free: balanceResult.data.free,
    transferable: balanceResult.data.transferable,
    formattedTransferable: balanceResult.data.formattedTransferable,
  };
}
