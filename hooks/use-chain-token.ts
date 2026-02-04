"use client";

import { useState, useEffect } from "react";
import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import { getDenominations, type Denomination } from "@/lib/denominations";

export interface ChainTokenInfo {
  symbol: string;
  decimals: number;
  denominations: Denomination[];
  existentialDeposit: bigint;
  loading: boolean;
}

export function useChainToken(
  client: DedotClient<PolkadotApi> | null
): ChainTokenInfo {
  const [info, setInfo] = useState<Omit<ChainTokenInfo, "loading">>({
    symbol: "DOT",
    decimals: 10,
    denominations: getDenominations("DOT", 10),
    existentialDeposit: BigInt("10000000000"), // 1 DOT default
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const properties = await client.chainSpec.properties();
        const decimalsRaw = properties.tokenDecimals;
        const symbolRaw = properties.tokenSymbol;

        // Handle array or single values
        const decimals = Array.isArray(decimalsRaw)
          ? decimalsRaw[0]
          : decimalsRaw ?? 10;
        const symbol = Array.isArray(symbolRaw)
          ? symbolRaw[0]
          : symbolRaw ?? "UNIT";

        const ed = client.consts.balances.existentialDeposit;

        if (!cancelled) {
          setInfo({
            symbol,
            decimals,
            denominations: getDenominations(symbol, decimals),
            existentialDeposit: BigInt(ed.toString()),
          });
        }
      } catch (err) {
        console.error("Failed to fetch chain token info:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [client]);

  return { ...info, loading };
}
