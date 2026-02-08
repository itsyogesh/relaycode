import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import { fetchValidators as fetchValidatorsApi } from "@/lib/api/subscan";
import { fetchNominationPools as fetchPoolsApi } from "@/lib/api/subscan";
import type {
  StakingContext,
  ValidatorInfo,
  PoolInfo,
  ChainTokenMeta,
} from "@/types/pallet-context";
import { formatCommission, bytesToName } from "./utils";

export async function fetchStakingContext(
  client: DedotClient<PolkadotApi>,
  network: string,
  tokenMeta: ChainTokenMeta
): Promise<StakingContext> {
  const [validators, pools, eras] = await Promise.all([
    fetchValidatorsWithFallback(client, network),
    fetchPoolsWithFallback(client, network),
    fetchEras(client),
  ]);

  return {
    type: "staking",
    validators,
    pools,
    ...eras,
    ...tokenMeta,
  };
}

async function fetchValidatorsWithFallback(
  client: DedotClient<PolkadotApi>,
  network: string
): Promise<ValidatorInfo[]> {
  try {
    const apiData = await fetchValidatorsApi(network);
    return apiData
      .filter((v) => v.stash_account_display?.address)
      .map((v) => {
        const display = v.stash_account_display;
        const people = display?.people;
        const identityName = people?.parent_display
          ? `${people.parent_display}/${people.sub_symbol ?? ""}`
          : people?.display;

        return {
          address: display!.address!,
          identity: identityName || undefined,
          isVerified: people?.identity ?? false,
          commission: formatCommission(v.validator_prefs_value ?? 0),
          totalStake: v.bonded_total,
          nominatorCount: v.count_nominators,
          isActive: !v.status || v.status === "",
          isOversubscribed: false,
        };
      });
  } catch {
    return fetchValidatorsFromRpc(client);
  }
}

async function fetchValidatorsFromRpc(
  client: DedotClient<PolkadotApi>
): Promise<ValidatorInfo[]> {
  try {
    const validatorEntries = await client.query.staking.validators.entries();
    const validators: ValidatorInfo[] = [];

    for (const [key, prefs] of validatorEntries) {
      const address = typeof key === "string" ? key : String(key);
      const prefsObj = prefs as any;
      validators.push({
        address,
        commission: formatCommission(prefsObj?.commission ?? 0),
        isActive: true,
      });
    }

    return validators;
  } catch {
    return [];
  }
}

async function fetchPoolsWithFallback(
  client: DedotClient<PolkadotApi>,
  network: string
): Promise<PoolInfo[]> {
  try {
    const apiData = await fetchPoolsApi(network);
    return apiData.map((p) => ({
      id: p.pool_id,
      name: p.metadata || `Pool #${p.pool_id}`,
      state: p.state,
      memberCount: p.member_count,
      totalStake: p.total_bonded,
      depositor: p.pool_account?.address,
    }));
  } catch {
    return fetchPoolsFromRpc(client);
  }
}

async function fetchPoolsFromRpc(
  client: DedotClient<PolkadotApi>
): Promise<PoolInfo[]> {
  try {
    const poolEntries = await client.query.nominationPools.bondedPools.entries();
    const metadataEntries = await client.query.nominationPools.metadata.entries();

    const metadataMap = new Map<number, string>();
    for (const [key, value] of metadataEntries) {
      const id = typeof key === "number" ? key : Number(key);
      metadataMap.set(id, bytesToName(value as any));
    }

    const pools: PoolInfo[] = [];
    for (const [key, pool] of poolEntries) {
      if (!pool) continue;
      const id = typeof key === "number" ? key : Number(key);
      const p = pool as any;
      pools.push({
        id,
        name: metadataMap.get(id) || `Pool #${id}`,
        state: p.state?.type ?? "Unknown",
        memberCount: Number(p.memberCounter ?? 0),
        depositor: p.roles?.depositor,
      });
    }

    return pools;
  } catch {
    return [];
  }
}

async function fetchEras(
  client: DedotClient<PolkadotApi>
): Promise<{ currentEra?: number; activeEra?: number }> {
  try {
    const [currentEra, activeEra] = await Promise.all([
      client.query.staking.currentEra(),
      client.query.staking.activeEra(),
    ]);

    return {
      currentEra: currentEra != null ? Number(currentEra) : undefined,
      activeEra: activeEra != null
        ? Number((activeEra as any)?.index ?? activeEra)
        : undefined,
    };
  } catch {
    return {};
  }
}
