jest.mock("../../env.mjs", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://test.com" },
}));

import { truncateHash } from "../../utils/truncate-hash";

describe("truncateHash", () => {
  it("returns undefined for undefined input", () => {
    expect(truncateHash(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(truncateHash("")).toBeUndefined();
  });

  it("returns full string when shorter than truncation boundary", () => {
    // paddingLength=6, boundary = 6*2+1 = 13. "0x12345678" is 10 chars <= 13
    expect(truncateHash("0x12345678")).toBe("0x12345678");
  });

  it("truncates long hash with ellipsis", () => {
    const hash = "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3";
    const result = truncateHash(hash);
    expect(result).toContain("\u2026");
    expect(result!.startsWith("0x91b1")).toBe(true);
    expect(result!.endsWith("e90c3")).toBe(true);
  });

  it("uses custom paddingLength", () => {
    const hash = "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3";
    const result = truncateHash(hash, 10);
    expect(result!.startsWith("0x91b171bb")).toBe(true);
  });

  it("returns full string at exact boundary", () => {
    // paddingLength=6 means boundary = 6*2+1 = 13
    expect(truncateHash("1234567890123")).toBe("1234567890123");
  });

  it("truncates string just over boundary", () => {
    // 14 chars > 13 boundary
    const result = truncateHash("12345678901234");
    expect(result).toContain("\u2026");
  });
});
