export interface Denomination {
  label: string;
  multiplier: bigint;
  maxDecimals: number;
}

export function getDenominations(
  symbol: string,
  chainDecimals: number
): Denomination[] {
  const denoms: Denomination[] = [
    {
      label: symbol,
      multiplier: BigInt(10) ** BigInt(chainDecimals),
      maxDecimals: chainDecimals,
    },
  ];

  if (chainDecimals >= 3) {
    denoms.push({
      label: `m${symbol}`,
      multiplier: BigInt(10) ** BigInt(chainDecimals - 3),
      maxDecimals: chainDecimals - 3,
    });
  }

  denoms.push({
    label: "planck",
    multiplier: BigInt(1),
    maxDecimals: 0,
  });

  return denoms;
}

/**
 * Convert a human-readable value + denomination to a planck string.
 * Returns null if the input is invalid or has excess precision.
 */
export function toPlanck(
  humanValue: string,
  denom: Denomination
): string | null {
  if (!humanValue || humanValue.trim() === "") return null;

  const trimmed = humanValue.trim();

  // Validate format: optional digits, optional decimal point + digits
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === ".") return null;

  const parts = trimmed.split(".");
  const intPart = parts[0] || "0";
  const fracPart = parts[1] || "";

  // Check excess precision
  if (fracPart.length > denom.maxDecimals) return null;

  // Pad fractional part to maxDecimals length
  const paddedFrac = fracPart.padEnd(denom.maxDecimals, "0");

  // Combine and convert
  const combined = intPart + paddedFrac;
  const planck = BigInt(combined);

  // For planck denomination, multiplier is 1 and no fractions allowed
  if (denom.multiplier === BigInt(1)) {
    return planck.toString();
  }

  return planck.toString();
}

/**
 * Convert a planck string to a human-readable value for a given denomination.
 */
export function fromPlanck(planckValue: string, denom: Denomination): string {
  if (!planckValue) return "0";

  try {
    const value = BigInt(planckValue);
    if (denom.multiplier === BigInt(1)) return value.toString();

    const divisor = denom.multiplier;
    const intPart = value / divisor;
    const remainder = value % divisor;

    if (remainder === BigInt(0)) return intPart.toString();

    // Convert remainder to fractional string
    const fracStr = remainder.toString().padStart(denom.maxDecimals, "0");
    // Trim trailing zeros
    const trimmed = fracStr.replace(/0+$/, "");
    return `${intPart}.${trimmed}`;
  } catch {
    return "0";
  }
}
