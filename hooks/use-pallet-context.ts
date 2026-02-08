"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import { useChain } from "@luno-kit/react";
import type { PalletContextData, ContextGroup } from "@/types/pallet-context";
import { networkFromGenesisHash } from "@/types/pallet-context";
import { getContextGroup, fetchPalletContext } from "@/lib/pallet-context";

interface PalletContextResult {
  context: PalletContextData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache keyed by `group:genesisHash`
const contextCache = new Map<string, PalletContextData>();

export function usePalletContext(
  client: DedotClient<PolkadotApi> | null,
  palletName: string | undefined
): PalletContextResult {
  const [context, setContext] = useState<PalletContextData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { chain } = useChain();

  const genesisHash = chain?.genesisHash ?? "";
  const network = genesisHash ? networkFromGenesisHash(genesisHash) : "polkadot";
  const group = palletName ? getContextGroup(palletName) : undefined;

  const cacheKey = group ? `${group}:${genesisHash}` : "";

  const doFetch = useCallback(async () => {
    if (!client || !palletName || !group) {
      setContext(null);
      setIsLoading(false);
      return;
    }

    // Check cache
    const cached = contextCache.get(cacheKey);
    if (cached) {
      setContext(cached);
      setIsLoading(false);
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPalletContext(client, palletName, network);
      if (controller.signal.aborted) return;

      if (data) {
        contextCache.set(cacheKey, data);
      }
      setContext(data);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Failed to fetch context");
      setContext(null);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [client, palletName, group, cacheKey, network]);

  // Eager fetch on pallet change
  useEffect(() => {
    doFetch();
    return () => {
      abortRef.current?.abort();
    };
  }, [doFetch]);

  // Clear cache on chain switch
  useEffect(() => {
    contextCache.clear();
    setContext(null);
  }, [genesisHash]);

  return { context, isLoading, error, refetch: doFetch };
}
