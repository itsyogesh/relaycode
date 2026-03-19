import { fromPlanck, getDenominations } from "@/lib/denominations";

/**
 * Format a planck amount as a human-readable fee string in the chain's native token.
 * E.g., "0.0123 DOT" or "123.45 WND"
 */
export function formatFee(
  planckValue: bigint,
  symbol: string,
  decimals: number
): string {
  const denoms = getDenominations(symbol, decimals);
  // Use the main denomination (first one = full token)
  const mainDenom = denoms[0];
  const formatted = fromPlanck(planckValue.toString(), mainDenom);
  return `${formatted} ${symbol}`;
}

/**
 * Format a weight value for display.
 */
export function formatWeight(weight: { refTime: bigint; proofSize: bigint }): string {
  const refTime = formatCompact(weight.refTime);
  const proofSize = formatCompact(weight.proofSize);
  return `refTime: ${refTime}, proofSize: ${proofSize}`;
}

function formatCompact(value: bigint): string {
  if (value >= BigInt(1_000_000_000)) {
    const billions = Number(value) / 1_000_000_000;
    return `${billions.toFixed(2)}B`;
  }
  if (value >= BigInt(1_000_000)) {
    const millions = Number(value) / 1_000_000;
    return `${millions.toFixed(2)}M`;
  }
  if (value >= BigInt(1_000)) {
    const thousands = Number(value) / 1_000;
    return `${thousands.toFixed(2)}K`;
  }
  return value.toString();
}
