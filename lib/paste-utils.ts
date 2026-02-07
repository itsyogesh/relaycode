/**
 * Centralized paste detection and auto-formatting helpers.
 */

export interface PasteTransform {
  value: string;
  transformed: boolean;
  hint?: string;
}

/**
 * Auto-prepend 0x to hex strings that are missing the prefix.
 * Used by Hash and Bytes inputs.
 */
export function autoPrefix0x(raw: string): PasteTransform {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return { value: trimmed, transformed: false };

  if (!trimmed.startsWith("0x") && /^[0-9a-f]+$/.test(trimmed)) {
    return {
      value: `0x${trimmed}`,
      transformed: true,
      hint: "Added 0x prefix",
    };
  }
  return { value: trimmed, transformed: false };
}

/**
 * Strip common numeric formatting characters (commas, spaces, underscores).
 * Used by Amount and Balance inputs.
 */
export function stripNumericFormatting(raw: string): PasteTransform {
  const trimmed = raw.trim();
  if (!trimmed) return { value: trimmed, transformed: false };

  const cleaned = trimmed.replace(/[,_ ]/g, "");
  if (cleaned !== trimmed) {
    return {
      value: cleaned,
      transformed: true,
      hint: "Removed formatting characters",
    };
  }
  return { value: trimmed, transformed: false };
}

/**
 * Detect if a pasted value looks like planck (raw integer with many digits).
 * Heuristic: if it's a pure integer string with more digits than chainDecimals,
 * it's likely a planck value.
 */
export function detectPlanckPaste(
  raw: string,
  chainDecimals: number
): { isPlanck: boolean; planckValue?: string } {
  const trimmed = raw.trim().replace(/[,_ ]/g, "");
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return { isPlanck: false };
  }

  // If the number has more digits than chainDecimals + 2, it's likely planck
  if (trimmed.length > chainDecimals + 2) {
    return { isPlanck: true, planckValue: trimmed };
  }
  return { isPlanck: false };
}
