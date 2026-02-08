import {
  bytesToName,
  formatCommission,
  truncateAddress,
  safeEntries,
} from "../../lib/pallet-context/utils";

describe("bytesToName", () => {
  it("converts a valid byte array to UTF-8 string", () => {
    expect(bytesToName([80, 111, 111, 108])).toBe("Pool");
  });

  it("converts Uint8Array to UTF-8 string", () => {
    expect(bytesToName(new Uint8Array([72, 101, 108, 108, 111]))).toBe("Hello");
  });

  it("returns empty string for empty array", () => {
    expect(bytesToName([])).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(bytesToName(undefined)).toBe("");
  });

  it("handles multi-byte UTF-8 characters", () => {
    // "é" = [195, 169]
    expect(bytesToName([195, 169])).toBe("é");
  });
});

describe("formatCommission", () => {
  it("returns 0 for 0 perbill", () => {
    expect(formatCommission(0)).toBe(0);
  });

  it("returns 100 for 1_000_000_000 perbill (100%)", () => {
    expect(formatCommission(1_000_000_000)).toBe(100);
  });

  it("returns 5 for 50_000_000 perbill (5%)", () => {
    expect(formatCommission(50_000_000)).toBe(5);
  });

  it("returns 0.01 for 100_000 perbill (0.01%)", () => {
    expect(formatCommission(100_000)).toBe(0.01);
  });

  it("rounds to 2 decimal places", () => {
    // 1 perbill = 0.0000001% → rounds to 0
    expect(formatCommission(1)).toBe(0);
  });

  it("works with bigint input", () => {
    expect(formatCommission(BigInt(1_000_000_000))).toBe(100);
    expect(formatCommission(BigInt(50_000_000))).toBe(5);
  });

  it("handles 10% (100_000_000 perbill)", () => {
    expect(formatCommission(100_000_000)).toBe(10);
  });
});

describe("truncateAddress", () => {
  it("returns empty string for undefined", () => {
    expect(truncateAddress(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(truncateAddress("")).toBe("");
  });

  it("returns short address unchanged", () => {
    const short = "12345678";
    expect(truncateAddress(short)).toBe(short);
  });

  it("returns address at threshold length unchanged", () => {
    // Default chars=6, threshold = 6*2+3 = 15
    const exact = "123456789012345"; // 15 chars
    expect(truncateAddress(exact)).toBe(exact);
  });

  it("truncates long address to XXXXXX...XXXXXX format", () => {
    const long = "1234567890ABCDEFGHIJ";
    expect(truncateAddress(long)).toBe("123456...EFGHIJ");
  });

  it("respects custom chars parameter", () => {
    const addr = "1234567890ABCDEFGHIJ"; // 20 chars
    expect(truncateAddress(addr, 4)).toBe("1234...GHIJ");
  });
});

describe("safeEntries", () => {
  it("returns data when entries() succeeds", async () => {
    const data = [1, 2, 3];
    const query = { entries: jest.fn().mockResolvedValue(data) };
    expect(await safeEntries(query)).toEqual(data);
  });

  it("returns empty array when entries() throws", async () => {
    const query = { entries: jest.fn().mockRejectedValue(new Error("fail")) };
    expect(await safeEntries(query)).toEqual([]);
  });
});
