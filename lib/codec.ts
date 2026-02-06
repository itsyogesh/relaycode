import { DedotClient } from "dedot";
import { u8aToHex, hexToU8a, hexStripPrefix, hexAddPrefix, decodeAddress } from "dedot/utils";

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

    // Try basic encoding first
    try {
      const encoded = codec.tryEncode(coerced);
      return { success: true, hex: u8aToHex(encoded) };
    } catch {
      // If basic encoding fails, try type-aware coercion (e.g., MultiAddress wrapping)
      const smartCoerced = coerceForType(client, typeId, value);
      if (smartCoerced !== undefined) {
        const encoded = codec.tryEncode(smartCoerced);
        return { success: true, hex: u8aToHex(encoded) };
      }
      // Re-try with basic coercion to get the original error
      const encoded = codec.tryEncode(coerced);
      return { success: true, hex: u8aToHex(encoded) };
    }
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
 * Try type-aware coercion when basic coercion fails.
 * Handles patterns like MultiAddress (SS58 string → {type: "Id", value: bytes}).
 */
function coerceForType(
  client: DedotClient<any>,
  typeId: number,
  value: unknown
): unknown | undefined {
  if (typeof value !== "string" || !value) return undefined;

  try {
    // Check if the type is an enum with an "Id" variant (MultiAddress pattern)
    const portableType = client.registry.findType(typeId);
    const typeDef = portableType?.typeDef;
    if (typeDef && typeDef.type === "Enum") {
      const members = typeDef.value.members;
      const hasIdVariant = members.some((m) => m.name === "Id");

      if (hasIdVariant) {
        // Try to decode as SS58 address and wrap as enum Id variant
        try {
          const bytes = decodeAddress(value);
          return { type: "Id", value: bytes };
        } catch {
          // Not a valid address, fall through
        }
      }
    }
  } catch {
    // Type lookup failed, fall through
  }

  return undefined;
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

    // Convert decoded value to form-compatible format
    const formValue = flattenDecodedValue(value);
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
 * Flatten a decoded Dedot value to a form-compatible format.
 * Handles common patterns like enum variants (MultiAddress {type, value})
 * and BigInt conversion.
 */
function flattenDecodedValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  // BigInt → string
  if (typeof value === "bigint") return value.toString();

  // Primitives pass through
  if (typeof value !== "object") return value;

  // Uint8Array → hex string
  if (value instanceof Uint8Array) {
    return u8aToHex(value);
  }

  // Arrays: recursively flatten each element
  if (Array.isArray(value)) {
    return value.map(flattenDecodedValue);
  }

  const obj = value as Record<string, unknown>;

  // Dedot enum variant objects: { type: "VariantName", value: innerValue }
  // e.g. MultiAddress { type: "Id", value: AccountId32 }
  if ("type" in obj && typeof obj.type === "string") {
    const innerValue = "value" in obj ? obj.value : undefined;
    // For simple enum variants with no inner data (e.g. RewardDestination::Staked),
    // preserve the full enum object so the Enum component can read the variant name.
    if (innerValue === undefined || innerValue === null) {
      return { type: obj.type };
    }
    // For enum variants with inner data (e.g. MultiAddress::Id(AccountId32)),
    // flatten the inner value for display in leaf components.
    // Note: use flattenDecodedValueEnum() for contexts where enum structure must be preserved.
    return flattenDecodedValue(innerValue);
  }

  // Dedot wrapper objects (e.g. AccountId32) that have toJSON() returning a primitive.
  // These are rich type objects that serialize to meaningful strings (like SS58 addresses).
  if (typeof (obj as any).toJSON === "function") {
    const json = (obj as any).toJSON();
    if (typeof json === "string" || typeof json === "number" || typeof json === "boolean") {
      return typeof json === "number" ? json.toString() : json;
    }
  }

  // Objects with meaningful toString() (not default "[object Object]")
  const str = String(value);
  if (str && !str.startsWith("[object ")) {
    return str;
  }

  // Plain objects: recursively flatten fields
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = flattenDecodedValue(v);
  }
  return result;
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

        // Convert decoded value to form-compatible format
        result[fieldName] = flattenDecodedValue(value);
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

