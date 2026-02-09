import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import type { AssetsContext, AssetInfo, ChainTokenMeta } from "@/types/pallet-context";
import { bytesToName } from "./utils";

export async function fetchAssetsContext(
  client: DedotClient<PolkadotApi>,
  _network: string,
  tokenMeta: ChainTokenMeta
): Promise<AssetsContext> {
  const assets = await fetchAssetsFromRpc(client);

  return {
    type: "assets",
    assets,
    ...tokenMeta,
  };
}

async function fetchAssetsFromRpc(
  client: DedotClient<PolkadotApi>
): Promise<AssetInfo[]> {
  try {
    const query = client.query as any;
    if (!query.assets) return [];

    const [metadataEntries, assetEntries] = await Promise.all([
      safeEntries(() => query.assets.metadata.entries()),
      safeEntries(() => query.assets.asset.entries()),
    ]);

    // Build metadata map: assetId → { name, symbol, decimals }
    const metadataMap = new Map<number, { name: string; symbol: string; decimals: number }>();
    for (const entry of metadataEntries) {
      const [key, meta] = entry as [unknown, unknown];
      const id = typeof key === "number" ? key : Number(key);
      const m = meta as any;
      metadataMap.set(id, {
        name: extractStringField(m?.name) || `Asset #${id}`,
        symbol: extractStringField(m?.symbol) || "",
        decimals: Number(m?.decimals ?? 0),
      });
    }

    // Build asset list from asset entries
    const assets: AssetInfo[] = [];
    for (const entry of assetEntries) {
      const [key, asset] = entry as [unknown, unknown];
      if (!asset) continue;
      const id = typeof key === "number" ? key : Number(key);
      const a = asset as any;
      const meta = metadataMap.get(id);

      assets.push({
        id,
        name: meta?.name || `Asset #${id}`,
        symbol: meta?.symbol || "",
        decimals: meta?.decimals ?? 0,
        totalSupply: a.supply?.toString(),
        admin: a.admin,
        isFrozen: a.isFrozen ?? a.status?.type === "Frozen",
      });
    }

    return assets.sort((a, b) => a.id - b.id);
  } catch {
    return [];
  }
}

function extractStringField(field: unknown): string {
  if (typeof field === "string") return field;
  if (Array.isArray(field)) return bytesToName(field);
  if (field instanceof Uint8Array) return bytesToName(field);
  return "";
}

async function safeEntries<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}
