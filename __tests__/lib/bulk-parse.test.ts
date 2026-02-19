jest.mock("../../env.mjs", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://test.com" },
}));

import { parseJsonBulk, parseSeparatedValues } from "../../lib/bulk-parse";

describe("parseJsonBulk", () => {
  // Without expectPairs
  it("returns error for empty input", () => {
    const result = parseJsonBulk("");
    expect(result).toEqual({ success: false, values: [], error: "Empty input", count: 0 });
  });

  it("returns error for invalid JSON", () => {
    const result = parseJsonBulk("{invalid}");
    expect(result).toEqual({ success: false, values: [], error: "Invalid JSON", count: 0 });
  });

  it("parses a valid JSON array", () => {
    const result = parseJsonBulk('[1, 2, 3]');
    expect(result).toEqual({ success: true, values: [1, 2, 3], count: 3 });
  });

  it("returns error for non-array JSON (object)", () => {
    const result = parseJsonBulk('{"key": "value"}');
    expect(result).toEqual({ success: false, values: [], error: "Expected JSON array", count: 0 });
  });

  it("parses empty JSON array", () => {
    const result = parseJsonBulk('[]');
    expect(result).toEqual({ success: true, values: [], count: 0 });
  });

  it("parses array of strings", () => {
    const result = parseJsonBulk('["a", "b"]');
    expect(result).toEqual({ success: true, values: ["a", "b"], count: 2 });
  });

  // With expectPairs = true
  it("parses object to entries when expectPairs is true", () => {
    const result = parseJsonBulk('{"key1": "val1", "key2": "val2"}', true);
    expect(result.success).toBe(true);
    expect(result.values).toEqual([["key1", "val1"], ["key2", "val2"]]);
    expect(result.count).toBe(2);
  });

  it("parses array of pairs when expectPairs is true", () => {
    const result = parseJsonBulk('[["k1", "v1"], ["k2", "v2"]]', true);
    expect(result.success).toBe(true);
    expect(result.values).toEqual([["k1", "v1"], ["k2", "v2"]]);
    expect(result.count).toBe(2);
  });

  it("rejects invalid pairs (length != 2) when expectPairs is true", () => {
    const result = parseJsonBulk('[["k1", "v1", "extra"]]', true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("pairs");
  });

  it("rejects non-array pair items when expectPairs is true", () => {
    const result = parseJsonBulk('["not-a-pair"]', true);
    expect(result.success).toBe(false);
  });

  it("rejects non-object non-array when expectPairs is true", () => {
    const result = parseJsonBulk('"just a string"', true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Expected object or array");
  });

  it("handles whitespace input", () => {
    const result = parseJsonBulk("   ");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Empty input");
  });

  it("parses JSON with nested objects", () => {
    const result = parseJsonBulk('[{"id": 1}, {"id": 2}]');
    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
  });
});

describe("parseSeparatedValues", () => {
  it("returns error for empty input", () => {
    const result = parseSeparatedValues("");
    expect(result).toEqual({ success: false, values: [], error: "Empty input", count: 0 });
  });

  it("parses newline-separated values", () => {
    const result = parseSeparatedValues("a\nb\nc");
    expect(result).toEqual({ success: true, values: ["a", "b", "c"], count: 3 });
  });

  it("parses comma-separated values", () => {
    const result = parseSeparatedValues("a,b,c");
    expect(result).toEqual({ success: true, values: ["a", "b", "c"], count: 3 });
  });

  it("parses mixed comma and newline separators", () => {
    const result = parseSeparatedValues("a,b\nc");
    expect(result).toEqual({ success: true, values: ["a", "b", "c"], count: 3 });
  });

  it("trims whitespace from values", () => {
    const result = parseSeparatedValues("  a , b , c  ");
    expect(result).toEqual({ success: true, values: ["a", "b", "c"], count: 3 });
  });

  it("filters out blank values", () => {
    const result = parseSeparatedValues("a,,b,,c");
    expect(result).toEqual({ success: true, values: ["a", "b", "c"], count: 3 });
  });

  it("parses single value", () => {
    const result = parseSeparatedValues("hello");
    expect(result).toEqual({ success: true, values: ["hello"], count: 1 });
  });
});
