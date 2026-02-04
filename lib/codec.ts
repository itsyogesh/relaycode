import { DedotClient } from "dedot";
import { u8aToHex, hexToU8a, hexStripPrefix, hexAddPrefix } from "dedot/utils";

/**
 * Result type for encoding operations
 */
export type EncodeResult =
  | { success: true; hex: string }
  | { success: false; hex: "0x"; error: string };

/**
 * Encode a single form value to hex using the field's typeId from metadata.
 * Returns a result object with success/error info.
 */
export function encodeArg(
  client: DedotClient<any>,
  typeId: number,
  value: unknown
): EncodeResult {
  try {
    const codec = client.registry.findCodec(typeId);
    const coerced = coerceValue(value);
    const encoded = codec.tryEncode(coerced);
    return { success: true, hex: u8aToHex(encoded) };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown encoding error";
    return { success: false, hex: "0x", error: errorMessage };
  }
}

/**
 * Legacy function for backward compatibility - returns just the hex string.
 * Use encodeArgWithResult for error info.
 */
export function encodeArgLegacy(
  client: DedotClient<any>,
  typeId: number,
  value: unknown
): string {
  const result = encodeArg(client, typeId, value);
  return result.hex;
}

/**
 * Coerce form string values to types that Dedot codecs expect.
 * Form inputs always produce strings, but codecs may need bigint/number/boolean.
 */
function coerceValue(value: unknown): unknown {
  if (typeof value !== "string") return value;

  // Boolean
  if (value === "true") return true;
  if (value === "false") return false;

  // Try BigInt for numeric strings (Balance, u128, etc.)
  if (/^\d+$/.test(value)) {
    try {
      return BigInt(value);
    } catch {
      // fall through
    }
  }

  return value;
}

/**
 * Result type for decoding operations
 */
export type DecodeResult =
  | { success: true; value: unknown; bytesConsumed: number }
  | { success: false; error: string };

/**
 * Decode hex back to a form value using the field's typeId from metadata.
 * Returns a result object with success/error info and bytes consumed.
 */
export function decodeArg(
  client: DedotClient<any>,
  typeId: number,
  hex: string
): DecodeResult {
  try {
    const codec = client.registry.findCodec(typeId);
    const bytes = hexToU8a(hex);
    const value = codec.tryDecode(bytes);

    // Re-encode to figure out how many bytes were consumed
    const reEncoded = codec.tryEncode(value);
    const bytesConsumed = reEncoded.length;

    // Convert BigInt to string for form compatibility
    const formValue = typeof value === "bigint" ? value.toString() : value;
    return { success: true, value: formValue, bytesConsumed };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown decoding error";
    return { success: false, error: errorMessage };
  }
}

/**
 * Legacy function for backward compatibility - returns just the value or throws.
 */
export function decodeArgLegacy(
  client: DedotClient<any>,
  typeId: number,
  hex: string
): unknown {
  const result = decodeArg(client, typeId, hex);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.value;
}

/**
 * Result type for bulk encoding operations
 */
export interface EncodeAllResult {
  argResults: EncodeResult[];
  argHexes: string[];
  concatenated: string;
  hasErrors: boolean;
  errors: Map<string, string>;
}

/**
 * Encode all form args, returning per-arg results and concatenated hex.
 */
export function encodeAllArgs(
  client: DedotClient<any>,
  fields: readonly { name?: string; typeId: number }[],
  formValues: Record<string, unknown>
): EncodeAllResult {
  const argResults: EncodeResult[] = [];
  const argHexes: string[] = [];
  const errors = new Map<string, string>();
  let concat = "";
  let hasErrors = false;

  for (const field of fields) {
    const fieldName = field.name || "";
    const value = formValues[fieldName];
    const result = encodeArg(client, field.typeId, value);

    argResults.push(result);
    argHexes.push(result.hex);

    if (result.success) {
      concat += hexStripPrefix(result.hex);
    } else {
      hasErrors = true;
      errors.set(fieldName, result.error);
    }
  }

  return {
    argResults,
    argHexes,
    concatenated: hexAddPrefix(concat),
    hasErrors,
    errors,
  };
}

/**
 * Result type for bulk decoding operations
 */
export interface DecodeAllResult {
  success: boolean;
  values: Record<string, unknown> | null;
  errors: Map<string, string>;
  totalBytesConsumed: number;
}

/**
 * Decode concatenated args hex back to individual form values.
 * Decodes sequentially, consuming bytes from the buffer.
 * Returns detailed result with per-field errors and byte consumption info.
 */
export function decodeAllArgs(
  client: DedotClient<any>,
  fields: readonly { name?: string; typeId: number }[],
  hex: string
): DecodeAllResult {
  const errors = new Map<string, string>();
  const result: Record<string, unknown> = {};
  let totalBytesConsumed = 0;

  try {
    const bytes = hexToU8a(hex);
    let offset = 0;

    for (const field of fields) {
      const fieldName = field.name || "";
      const codec = client.registry.findCodec(field.typeId);

      // Decode from the remaining bytes
      const remaining = bytes.slice(offset);

      if (remaining.length === 0) {
        errors.set(fieldName, "No more bytes to decode");
        return {
          success: false,
          values: null,
          errors,
          totalBytesConsumed,
        };
      }

      try {
        const value = codec.tryDecode(remaining);

        // Re-encode to figure out how many bytes were consumed
        const reEncoded = codec.tryEncode(value);
        const bytesConsumed = reEncoded.length;

        // Validate that re-encoding produces the same bytes
        const originalSlice = remaining.slice(0, bytesConsumed);
        if (!arraysEqual(reEncoded, originalSlice)) {
          // This could indicate a decoding issue with variable-length types
          console.warn(`Re-encoded bytes differ for field ${fieldName}`);
        }

        offset += bytesConsumed;
        totalBytesConsumed += bytesConsumed;

        // Convert BigInt to string for form compatibility
        result[fieldName] = typeof value === "bigint" ? value.toString() : value;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        errors.set(fieldName, errorMessage);
        return {
          success: false,
          values: null,
          errors,
          totalBytesConsumed,
        };
      }
    }

    // Validate that we consumed all bytes
    if (offset !== bytes.length) {
      console.warn(
        `Decoded ${offset} bytes but input had ${bytes.length} bytes. ` +
        `${bytes.length - offset} bytes remaining.`
      );
    }

    return {
      success: true,
      values: result,
      errors,
      totalBytesConsumed,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    errors.set("_global", errorMessage);
    return {
      success: false,
      values: null,
      errors,
      totalBytesConsumed,
    };
  }
}

/**
 * Helper to compare two Uint8Arrays
 */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
