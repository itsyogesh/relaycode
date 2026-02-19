jest.mock("../../env.mjs", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://test.com" },
}));

import {
  autoPrefix0x,
  stripNumericFormatting,
  detectPlanckPaste,
} from "../../lib/paste-utils";

describe("autoPrefix0x", () => {
  it("returns empty string untransformed for empty input", () => {
    expect(autoPrefix0x("")).toEqual({ value: "", transformed: false });
  });

  it("does not transform value that already has 0x prefix", () => {
    const result = autoPrefix0x("0xabcdef");
    expect(result.transformed).toBe(false);
    expect(result.value).toBe("0xabcdef");
  });

  it("adds 0x prefix to bare hex string", () => {
    const result = autoPrefix0x("abcdef");
    expect(result.transformed).toBe(true);
    expect(result.value).toBe("0xabcdef");
    expect(result.hint).toBe("Added 0x prefix");
  });

  it("does not transform non-hex string", () => {
    const result = autoPrefix0x("hello world");
    expect(result.transformed).toBe(false);
  });

  it("lowercases uppercase hex input", () => {
    const result = autoPrefix0x("ABCDEF");
    expect(result.value).toBe("0xabcdef");
    expect(result.transformed).toBe(true);
  });

  it("lowercases input with existing 0x prefix", () => {
    const result = autoPrefix0x("0xABCDEF");
    expect(result.value).toBe("0xabcdef");
    expect(result.transformed).toBe(false);
  });

  it("trims whitespace before processing", () => {
    const result = autoPrefix0x("  abcdef  ");
    expect(result.value).toBe("0xabcdef");
    expect(result.transformed).toBe(true);
  });
});

describe("stripNumericFormatting", () => {
  it("returns empty string untransformed for empty input", () => {
    expect(stripNumericFormatting("")).toEqual({ value: "", transformed: false });
  });

  it("does not transform value without formatting", () => {
    const result = stripNumericFormatting("12345");
    expect(result.transformed).toBe(false);
    expect(result.value).toBe("12345");
  });

  it("removes commas", () => {
    const result = stripNumericFormatting("1,000,000");
    expect(result.transformed).toBe(true);
    expect(result.value).toBe("1000000");
    expect(result.hint).toBe("Removed formatting characters");
  });

  it("removes underscores", () => {
    const result = stripNumericFormatting("1_000_000");
    expect(result.transformed).toBe(true);
    expect(result.value).toBe("1000000");
  });

  it("removes spaces", () => {
    const result = stripNumericFormatting("1 000 000");
    expect(result.transformed).toBe(true);
    expect(result.value).toBe("1000000");
  });

  it("removes mixed formatting characters", () => {
    const result = stripNumericFormatting("1,000_000 000");
    expect(result.transformed).toBe(true);
    expect(result.value).toBe("1000000000");
    expect(result.hint).toBe("Removed formatting characters");
  });
});

describe("detectPlanckPaste", () => {
  it("returns isPlanck false for empty input", () => {
    expect(detectPlanckPaste("", 10)).toEqual({ isPlanck: false });
  });

  it("returns isPlanck false for non-numeric input", () => {
    expect(detectPlanckPaste("abc", 10)).toEqual({ isPlanck: false });
  });

  it("returns isPlanck false for short number below threshold", () => {
    // chainDecimals=10, threshold = 10+2=12 digits. "12345" is 5 digits
    expect(detectPlanckPaste("12345", 10)).toEqual({ isPlanck: false });
  });

  it("returns isPlanck false at the threshold boundary", () => {
    // chainDecimals=10, threshold = 12 digits. 12 digits is NOT > 12
    expect(detectPlanckPaste("123456789012", 10)).toEqual({ isPlanck: false });
  });

  it("returns isPlanck true for number above threshold", () => {
    // chainDecimals=10, threshold = 12 digits. 13 digits > 12
    const result = detectPlanckPaste("1234567890123", 10);
    expect(result.isPlanck).toBe(true);
    expect(result.planckValue).toBe("1234567890123");
  });

  it("returns isPlanck true for large planck value", () => {
    const result = detectPlanckPaste("12345678901234", 10);
    expect(result.isPlanck).toBe(true);
    expect(result.planckValue).toBe("12345678901234");
  });

  it("strips formatting characters before checking", () => {
    // "1,234,567,890,123" => "1234567890123" = 13 digits
    const result = detectPlanckPaste("1,234,567,890,123", 10);
    expect(result.isPlanck).toBe(true);
    expect(result.planckValue).toBe("1234567890123");
  });

  it("returns isPlanck false for decimal numbers", () => {
    // "1.5" is not a pure integer
    expect(detectPlanckPaste("1.5", 10)).toEqual({ isPlanck: false });
  });
});
