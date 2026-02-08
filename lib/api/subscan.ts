function subscanBase(network: string) {
  return `/api/subscan/${network}`;
}

export interface SubscanValidator {
  rank_validator?: number;
  bonded_nominators: string;
  bonded_owner: string;
  count_nominators: number;
  validator_prefs_value: number;
  latest_mining?: number;
  stash_account_display?: {
    address?: string;
    people?: {
      display?: string;
      identity?: boolean;
      parent_display?: string;
      sub_symbol?: string;
    };
  };
  controller_account_display?: {
    address?: string;
  };
  bonded_total: string;
  status?: string;
  blocked?: boolean;
}

export interface SubscanPool {
  pool_id: number;
  metadata: string;
  state: string;
  member_count: number;
  total_bonded: string;
  pool_account?: {
    address?: string;
    display?: string;
  };
  nominator_account?: {
    address?: string;
  };
}

export async function fetchValidators(
  network: string,
  options?: { page?: number; row?: number }
): Promise<SubscanValidator[]> {
  const res = await fetch(`${subscanBase(network)}/scan/staking/validators`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_field: "bonded_total",
      order: "desc",
      page: options?.page ?? 0,
      row: options?.row ?? 100,
    }),
  });

  if (!res.ok) throw new Error(`Subscan error: ${res.status}`);
  const data = await res.json();
  return data.data?.list ?? [];
}

export async function fetchNominationPools(
  network: string,
  options?: { page?: number; row?: number }
): Promise<SubscanPool[]> {
  const res = await fetch(`${subscanBase(network)}/scan/nomination_pool/pools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_field: "pool_id",
      order: "asc",
      page: options?.page ?? 0,
      row: options?.row ?? 100,
      status: [],
    }),
  });

  if (!res.ok) throw new Error(`Subscan error: ${res.status}`);
  const data = await res.json();
  return data.data?.list ?? [];
}
