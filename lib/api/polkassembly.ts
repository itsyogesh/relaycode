const POLKASSEMBLY_BASE = "/api/polkassembly";

export interface PolkassemblyReferendum {
  post_id: number;
  title: string;
  status: string;
  track_no: number;
  track_name?: string;
  proposer?: string;
  tally?: {
    ayes: string;
    nays: string;
    support: string;
  };
  created_at: string;
}

export interface PolkassemblyBounty {
  post_id: number;
  title: string;
  content: string;
  status: string;
  curator?: string;
  reward?: string;
  created_at: string;
}

export async function fetchReferenda(
  network: string,
  options?: { trackStatus?: string; page?: number; listingLimit?: number }
): Promise<PolkassemblyReferendum[]> {
  const params = new URLSearchParams({
    proposalType: "referendums_v2",
    sortBy: "newest",
    listingLimit: String(options?.listingLimit ?? 100),
    page: String(options?.page ?? 1),
    network,
  });

  if (options?.trackStatus) {
    params.set("trackStatus", options.trackStatus);
  }

  const res = await fetch(`${POLKASSEMBLY_BASE}/listing/on-chain-posts?${params}`);
  if (!res.ok) throw new Error(`Polkassembly error: ${res.status}`);

  const data = await res.json();
  return (data.posts ?? []).map((post: any) => ({
    post_id: post.post_id,
    title: post.title ?? "",
    status: post.status ?? "",
    track_no: post.track_no ?? 0,
    track_name: post.track_name,
    proposer: post.proposer,
    tally: post.tally,
    created_at: post.created_at,
  }));
}

export async function fetchBounties(
  network: string
): Promise<PolkassemblyBounty[]> {
  const params = new URLSearchParams({
    proposalType: "bounties",
    sortBy: "newest",
    listingLimit: "100",
    page: "1",
    network,
  });

  const res = await fetch(`${POLKASSEMBLY_BASE}/listing/on-chain-posts?${params}`);
  if (!res.ok) throw new Error(`Polkassembly error: ${res.status}`);

  const data = await res.json();
  return (data.posts ?? []).map((post: any) => ({
    post_id: post.post_id,
    title: post.title ?? "",
    content: post.content ?? "",
    status: post.status ?? "",
    curator: post.curator,
    reward: post.reward,
    created_at: post.created_at,
  }));
}
