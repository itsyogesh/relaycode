export function bytesToName(bytes: number[] | Uint8Array | undefined): string {
  if (!bytes || bytes.length === 0) return "";
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
}

export function formatCommission(perbill: bigint | number): number {
  // Perbill: 1_000_000_000 = 100%
  const percent = Number(perbill) / 10_000_000;
  return Math.round(percent * 100) / 100; // Round to 2 decimal places
}

export function truncateAddress(address: string | undefined, chars = 6): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function safeEntries<T>(
  query: { entries: () => Promise<T[]> }
): Promise<T[]> {
  try {
    return await query.entries();
  } catch {
    return [];
  }
}
