const WISESAMA_BASE = "/api/wisesama";

export interface WisesamaIdentity {
  address: string;
  display: string;
  isVerified: boolean;
  judgements?: Array<{
    registrar: number;
    judgement: string;
  }>;
  riskLevel?: string;
}

// Simple in-memory cache with 1hr TTL
const identityCache = new Map<string, { data: WisesamaIdentity; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(address: string, chain: string) {
  return `${address}:${chain}`;
}

export async function fetchIdentity(
  address: string,
  chain: string
): Promise<WisesamaIdentity | null> {
  const key = getCacheKey(address, chain);
  const cached = identityCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `${WISESAMA_BASE}/identity/${encodeURIComponent(address)}?chain=${encodeURIComponent(chain)}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const identity: WisesamaIdentity = {
      address,
      display: data.displayName ?? data.display ?? "",
      isVerified: data.isVerified ?? false,
      judgements: data.judgements,
      riskLevel: data.riskLevel,
    };

    identityCache.set(key, { data: identity, expiry: Date.now() + CACHE_TTL });
    return identity;
  } catch {
    return null;
  }
}

export async function fetchIdentityBatch(
  addresses: string[],
  chain: string
): Promise<Map<string, WisesamaIdentity>> {
  const results = new Map<string, WisesamaIdentity>();
  const uncached: string[] = [];

  // Check cache first
  for (const addr of addresses) {
    const key = getCacheKey(addr, chain);
    const cached = identityCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      results.set(addr, cached.data);
    } else {
      uncached.push(addr);
    }
  }

  // Fetch uncached in parallel (limited concurrency)
  if (uncached.length > 0) {
    const batchSize = 10;
    for (let i = 0; i < uncached.length; i += batchSize) {
      const batch = uncached.slice(i, i + batchSize);
      const fetched = await Promise.allSettled(
        batch.map((addr) => fetchIdentity(addr, chain))
      );
      fetched.forEach((result, idx) => {
        if (result.status === "fulfilled" && result.value) {
          results.set(batch[idx], result.value);
        }
      });
    }
  }

  return results;
}

export function clearIdentityCache() {
  identityCache.clear();
}
