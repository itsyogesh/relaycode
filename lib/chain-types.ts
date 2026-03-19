import type { PolkadotApi, PolkadotAssetHubApi, WestendAssetHubApi, PaseoAssetHubApi } from "@dedot/chaintypes";
import type { DedotClient } from "dedot";

export type AssetHubApi = PolkadotAssetHubApi | WestendAssetHubApi | PaseoAssetHubApi;
export type AnyChainApi = PolkadotApi | AssetHubApi;

/**
 * Generic client type used throughout the app for metadata/registry/tx/consts access.
 * DedotClient is invariant on its type parameter, so a union like
 * `DedotClient<PolkadotApi | AssetHubApi>` is not assignable from specific clients.
 * We use `DedotClient<any>` as the shared type — all generic DedotClient features
 * (metadata, registry, tx, consts, chainSpec) work identically regardless of the
 * chain API type parameter.
 */
export type GenericChainClient = DedotClient<any>; // eslint-disable-line

const ASSET_HUB_GENESIS = new Set([
  "0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f", // Polkadot Asset Hub
  "0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9", // Westend Asset Hub
  "0xd6eec26135305a8ad257a20d003357284c8aa03d0bdb2b357ab0a22371e11ef2", // Paseo Asset Hub
]);

export function isAssetHubGenesis(genesisHash: string): boolean {
  return ASSET_HUB_GENESIS.has(genesisHash.toLowerCase());
}

export function hasReviveApi(client: GenericChainClient): client is DedotClient<AssetHubApi> {
  return typeof (client as any).call?.reviveApi?.instantiate === "function";
}
