import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import { fetchReferenda as fetchReferendaApi } from "@/lib/api/polkassembly";
import { fetchBounties as fetchBountiesApi } from "@/lib/api/polkassembly";
import type {
  GovernanceContext,
  ReferendumInfo,
  TrackInfo,
  BountyInfo,
  ChainTokenMeta,
} from "@/types/pallet-context";

export async function fetchGovernanceContext(
  client: DedotClient<PolkadotApi>,
  network: string,
  tokenMeta: ChainTokenMeta
): Promise<GovernanceContext> {
  // Fetch from APIs and RPC in parallel, prefer API data
  const [referenda, tracks, bounties] = await Promise.all([
    fetchReferendaWithFallback(client, network),
    fetchTracksFromRpc(client),
    fetchBountiesWithFallback(client, network),
  ]);

  return { type: "governance", referenda, tracks, bounties, ...tokenMeta };
}

async function fetchReferendaWithFallback(
  client: DedotClient<PolkadotApi>,
  network: string
): Promise<ReferendumInfo[]> {
  try {
    const apiData = await fetchReferendaApi(network);
    return apiData.map((r) => ({
      index: r.post_id,
      title: r.title || undefined,
      status: r.status,
      trackId: r.track_no,
      trackName: r.track_name,
      proposer: r.proposer,
      tally: r.tally,
      createdAt: r.created_at,
    }));
  } catch {
    // Fallback to RPC
    return fetchReferendaFromRpc(client);
  }
}

async function fetchReferendaFromRpc(
  client: DedotClient<PolkadotApi>
): Promise<ReferendumInfo[]> {
  try {
    const entries = await client.query.referenda.referendumInfoFor.entries();
    const referenda: ReferendumInfo[] = [];

    for (const [key, info] of entries) {
      const index = typeof key === "number" ? key : Number(key);
      if (info && typeof info === "object" && "type" in info) {
        const infoObj = info as any;
        if (infoObj.type === "Ongoing") {
          const ongoing = infoObj.value;
          referenda.push({
            index,
            status: "Ongoing",
            trackId: ongoing.track ?? 0,
            proposer: ongoing.submissionDeposit?.who,
            tally: ongoing.tally
              ? {
                  ayes: ongoing.tally.ayes?.toString() ?? "0",
                  nays: ongoing.tally.nays?.toString() ?? "0",
                  support: ongoing.tally.support?.toString() ?? "0",
                }
              : undefined,
          });
        }
      }
    }

    return referenda;
  } catch {
    return [];
  }
}

async function fetchTracksFromRpc(
  client: DedotClient<PolkadotApi>
): Promise<TrackInfo[]> {
  try {
    const tracks = client.consts.referenda.tracks as any;
    if (!Array.isArray(tracks)) return [];

    return tracks.map(([id, info]: [number, any]) => ({
      id: Number(id),
      name: info.name ?? `Track ${id}`,
      maxDeciding: info.maxDeciding ? Number(info.maxDeciding) : undefined,
    }));
  } catch {
    return [];
  }
}

async function fetchBountiesWithFallback(
  client: DedotClient<PolkadotApi>,
  network: string
): Promise<BountyInfo[]> {
  try {
    const apiData = await fetchBountiesApi(network);
    return apiData.map((b) => ({
      index: b.post_id,
      title: b.title || undefined,
      description: b.content ? b.content.slice(0, 200) : undefined,
      value: b.reward,
      curator: b.curator,
      status: b.status,
    }));
  } catch {
    // Fallback to RPC
    return fetchBountiesFromRpc(client);
  }
}

async function fetchBountiesFromRpc(
  client: DedotClient<PolkadotApi>
): Promise<BountyInfo[]> {
  try {
    const entries = await client.query.bounties.bounties.entries();
    const bounties: BountyInfo[] = [];

    for (const [key, bounty] of entries) {
      if (!bounty) continue;
      const index = typeof key === "number" ? key : Number(key);
      const b = bounty as any;
      bounties.push({
        index,
        value: b.value?.toString(),
        curator: b.status?.value?.curator,
        status: b.status?.type ?? "Unknown",
      });
    }

    return bounties;
  } catch {
    return [];
  }
}
