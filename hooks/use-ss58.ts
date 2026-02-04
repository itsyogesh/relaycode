"use client";

import { useMemo, useCallback } from "react";
import { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import { encodeAddress, decodeAddress } from "dedot/utils";

interface UseSS58Result {
  ss58Prefix: number;
  formatAddress: (address: string) => string | null;
  isValidAddress: (address: string) => boolean;
  truncateAddress: (address: string) => string;
}

export function useSS58(
  client: DedotClient<PolkadotApi> | null
): UseSS58Result {
  const ss58Prefix = useMemo(() => {
    if (!client) return 42; // Generic Substrate default
    try {
      return client.consts.system.ss58Prefix;
    } catch {
      return 42;
    }
  }, [client]);

  const isValidAddress = useCallback((address: string): boolean => {
    if (!address) return false;
    try {
      decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  }, []);

  const formatAddress = useCallback(
    (address: string): string | null => {
      if (!address) return null;
      try {
        const publicKey = decodeAddress(address);
        return encodeAddress(publicKey, ss58Prefix);
      } catch {
        return null;
      }
    },
    [ss58Prefix]
  );

  const truncateAddress = useCallback((address: string): string => {
    if (!address || address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }, []);

  return {
    ss58Prefix,
    formatAddress,
    isValidAddress,
    truncateAddress,
  };
}
