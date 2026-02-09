import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import type { ProxyContext, ProxyTypeInfo, ChainTokenMeta } from "@/types/pallet-context";

export async function fetchProxyContext(
  client: DedotClient<PolkadotApi>,
  _network: string,
  tokenMeta: ChainTokenMeta
): Promise<ProxyContext> {
  const proxyTypes = await fetchProxyTypesFromMetadata(client);

  return {
    type: "proxy",
    proxyTypes,
    ...tokenMeta,
  };
}

async function fetchProxyTypesFromMetadata(
  client: DedotClient<PolkadotApi>
): Promise<ProxyTypeInfo[]> {
  try {
    const metadata = client.metadata;
    if (!metadata) return getDefaultProxyTypes();

    // Find the Proxy pallet and its ProxyType enum from metadata
    const pallets = (metadata as any).pallets ?? (metadata as any).value?.pallets;
    if (!pallets) return getDefaultProxyTypes();

    const proxyPallet = pallets.find(
      (p: any) => p.name === "Proxy"
    );
    if (!proxyPallet) return getDefaultProxyTypes();

    // Walk through calls to find ProxyType enum type
    const calls = proxyPallet.calls;
    if (!calls) return getDefaultProxyTypes();

    const types = (metadata as any).types ?? (metadata as any).value?.types;
    if (!types) return getDefaultProxyTypes();

    // Find the ProxyType type by searching for enums with typical proxy variant names
    for (const typeDef of types) {
      const def = typeDef.type?.def ?? typeDef.def;
      if (!def) continue;

      const variant = def.Variant ?? def.variant;
      if (!variant) continue;

      const variants = variant.variants ?? variant;
      if (!Array.isArray(variants)) continue;

      const names = variants.map((v: any) => v.name?.toLowerCase?.() ?? "");
      // ProxyType typically has "Any" + "NonTransfer" or "Governance" variants
      if (names.includes("any") && (names.includes("nontransfer") || names.includes("governance"))) {
        return variants.map((v: any, i: number) => ({
          name: v.name ?? `Variant${i}`,
          index: v.index ?? i,
        }));
      }
    }

    return getDefaultProxyTypes();
  } catch {
    return getDefaultProxyTypes();
  }
}

function getDefaultProxyTypes(): ProxyTypeInfo[] {
  // Standard Polkadot/Kusama proxy types
  return [
    { name: "Any", index: 0 },
    { name: "NonTransfer", index: 1 },
    { name: "Governance", index: 2 },
    { name: "Staking", index: 3 },
    { name: "IdentityJudgement", index: 5 },
    { name: "CancelProxy", index: 6 },
    { name: "Auction", index: 7 },
    { name: "NominationPools", index: 8 },
  ];
}
