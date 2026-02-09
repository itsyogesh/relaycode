import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import type { CoretimeContext, CoreInfo, ChainTokenMeta } from "@/types/pallet-context";

export async function fetchCoretimeContext(
  client: DedotClient<PolkadotApi>,
  _network: string,
  tokenMeta: ChainTokenMeta
): Promise<CoretimeContext> {
  const [cores, currentPrice] = await Promise.all([
    fetchCoresFromRpc(client),
    fetchCurrentPrice(client),
  ]);

  return {
    type: "coretime",
    cores,
    currentPrice,
    ...tokenMeta,
  };
}

async function fetchCoresFromRpc(
  client: DedotClient<PolkadotApi>
): Promise<CoreInfo[]> {
  try {
    const query = client.query as any;
    if (!query.broker) return [];

    // Try to query regions or workplan for available cores
    const entries = await safeEntries(() => query.broker.workplan.entries());
    const coreSet = new Map<number, CoreInfo>();

    for (const entry of entries) {
      const [key] = entry as [unknown, unknown];
      const k = key as any;
      const core = typeof k === "number" ? k : Number(k?.[0] ?? k);
      if (!isNaN(core) && !coreSet.has(core)) {
        coreSet.set(core, { core });
      }
    }

    // Also try status for sale info
    try {
      const status = await query.broker.status();
      if (status) {
        const s = status as any;
        const coreCount = Number(s.coreCount ?? 0);
        // Ensure we have entries for all cores up to coreCount
        for (let i = 0; i < coreCount; i++) {
          if (!coreSet.has(i)) {
            coreSet.set(i, { core: i });
          }
        }
      }
    } catch {
      // status may not be available
    }

    return Array.from(coreSet.values()).sort((a, b) => a.core - b.core);
  } catch {
    return [];
  }
}

async function fetchCurrentPrice(
  client: DedotClient<PolkadotApi>
): Promise<string | undefined> {
  try {
    const query = client.query as any;
    if (!query.broker) return undefined;

    const saleInfo = await query.broker.saleInfo();
    if (!saleInfo) return undefined;
    const s = saleInfo as any;
    return s.price?.toString() ?? s.endPrice?.toString();
  } catch {
    return undefined;
  }
}

async function safeEntries<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}
