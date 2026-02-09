import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import type { PalletContextData, ContextGroup, ChainTokenMeta } from "@/types/pallet-context";
import { PALLET_CONTEXT_GROUP } from "@/types/pallet-context";
import { fetchGovernanceContext } from "./governance";
import { fetchStakingContext } from "./staking";
import { fetchProxyContext } from "./proxy";
import { fetchAssetsContext } from "./assets";
import { fetchVestingContext } from "./vesting";
import { fetchCoretimeContext } from "./coretime";
import { fetchXcmContext } from "./xcm";
import { fetchMultisigContext } from "./multisig";

export function getContextGroup(palletName: string): ContextGroup | undefined {
  return PALLET_CONTEXT_GROUP[palletName];
}

async function getChainTokenMeta(
  client: DedotClient<PolkadotApi>
): Promise<ChainTokenMeta> {
  try {
    const properties = await client.chainSpec.properties();
    const decimals = Array.isArray(properties.tokenDecimals)
      ? properties.tokenDecimals[0]
      : properties.tokenDecimals ?? 10;
    const symbol = Array.isArray(properties.tokenSymbol)
      ? properties.tokenSymbol[0]
      : properties.tokenSymbol ?? "UNIT";
    return { tokenSymbol: symbol, tokenDecimals: decimals };
  } catch {
    return { tokenSymbol: "DOT", tokenDecimals: 10 };
  }
}

export async function fetchPalletContext(
  client: DedotClient<PolkadotApi>,
  palletName: string,
  network: string
): Promise<PalletContextData | null> {
  const group = getContextGroup(palletName);
  if (!group) return null;

  const tokenMeta = await getChainTokenMeta(client);

  switch (group) {
    case "governance":
      return fetchGovernanceContext(client, network, tokenMeta);
    case "staking":
      return fetchStakingContext(client, network, tokenMeta);
    case "proxy":
      return fetchProxyContext(client, network, tokenMeta);
    case "assets":
      return fetchAssetsContext(client, network, tokenMeta);
    case "vesting":
      return fetchVestingContext(client, network, tokenMeta);
    case "coretime":
      return fetchCoretimeContext(client, network, tokenMeta);
    case "xcm":
      return fetchXcmContext(client, network, tokenMeta);
    case "multisig":
      return fetchMultisigContext(client, network, tokenMeta);
    default:
      return null;
  }
}
