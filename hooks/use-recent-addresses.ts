"use client";

import { useState, useCallback, useEffect } from "react";
import { decodeAddress, encodeAddress } from "dedot/utils";

const STORAGE_KEY = "relaycode:recent-addresses";
const MAX_RECENT = 10;

interface RecentAddress {
  address: string; // stored as generic SS58 (prefix 42)
  timestamp: number;
}

interface UseRecentAddressesResult {
  recentAddresses: RecentAddress[];
  addRecent: (address: string) => void;
  clearRecent: () => void;
}

function getPublicKeyHex(address: string): string | null {
  try {
    const pk = decodeAddress(address);
    return Array.from(pk)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

function normalizeAddress(address: string): string | null {
  try {
    const pk = decodeAddress(address);
    return encodeAddress(pk, 42); // Generic Substrate prefix
  } catch {
    return null;
  }
}

function loadFromStorage(): RecentAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is RecentAddress =>
        typeof item === "object" &&
        item !== null &&
        typeof item.address === "string" &&
        typeof item.timestamp === "number"
    );
  } catch {
    return [];
  }
}

function saveToStorage(addresses: RecentAddress[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch {
    // Ignore storage errors
  }
}

export function useRecentAddresses(): UseRecentAddressesResult {
  const [recentAddresses, setRecentAddresses] = useState<RecentAddress[]>([]);

  // Load from storage on mount
  useEffect(() => {
    setRecentAddresses(loadFromStorage());
  }, []);

  const addRecent = useCallback((address: string) => {
    const normalized = normalizeAddress(address);
    if (!normalized) return;

    const pkHex = getPublicKeyHex(address);
    if (!pkHex) return;

    setRecentAddresses((prev) => {
      // Remove any existing entry with the same public key
      const filtered = prev.filter((item) => {
        const itemPkHex = getPublicKeyHex(item.address);
        return itemPkHex !== pkHex;
      });

      // Add new entry at the beginning
      const updated = [
        { address: normalized, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT);

      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentAddresses([]);
    saveToStorage([]);
  }, []);

  return {
    recentAddresses,
    addRecent,
    clearRecent,
  };
}
