/**
 * JSON/CSV/line-based bulk parsing for vector and map input components.
 */

export interface BulkParseResult {
  success: boolean;
  values: unknown[];
  error?: string;
  count: number;
}

/**
 * Parse a JSON string into an array of values.
 * When expectPairs is true, accepts both `{"key":"value"}` objects and `[["key","value"]]` arrays.
 */
export function parseJsonBulk(input: string, expectPairs?: boolean): BulkParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { success: false, values: [], error: "Empty input", count: 0 };

  try {
    const parsed = JSON.parse(trimmed);

    if (expectPairs) {
      // Accept object form: {"key1": "val1", "key2": "val2"} → [[key1, val1], [key2, val2]]
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const entries = Object.entries(parsed);
        return { success: true, values: entries, count: entries.length };
      }
      // Accept array of pairs: [["key1", "val1"], ["key2", "val2"]]
      if (Array.isArray(parsed)) {
        const valid = parsed.every(
          (item) => Array.isArray(item) && item.length === 2
        );
        if (!valid) {
          return { success: false, values: [], error: "Expected array of [key, value] pairs", count: 0 };
        }
        return { success: true, values: parsed, count: parsed.length };
      }
      return { success: false, values: [], error: "Expected object or array of pairs", count: 0 };
    }

    // Plain array mode
    if (Array.isArray(parsed)) {
      return { success: true, values: parsed, count: parsed.length };
    }
    return { success: false, values: [], error: "Expected JSON array", count: 0 };
  } catch (e) {
    return { success: false, values: [], error: "Invalid JSON", count: 0 };
  }
}

/**
 * Parse a multi-line or separator-delimited string into an array of trimmed, non-empty values.
 */
export function parseSeparatedValues(
  input: string,
  separator: RegExp = /[\n,]/
): BulkParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { success: false, values: [], error: "Empty input", count: 0 };

  const values = trimmed
    .split(separator)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  return { success: true, values, count: values.length };
}
