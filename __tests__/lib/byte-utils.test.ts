jest.mock("../../env.mjs", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://test.com" },
}));

import {
  bytesToHex,
  hexToBytes,
  tryDecodeUtf8,
  base64ToBytes,
  bytesToBase64,
} from "../../lib/byte-utils";

describe("bytesToHex", () => {
  it("returns empty string for empty Uint8Array", () => {
    expect(bytesToHex(new Uint8Array([]))).toBe("");
  });

  it("converts single byte with zero-padding", () => {
    expect(bytesToHex(new Uint8Array([0x0a]))).toBe("0x0a");
  });

  it("converts multiple bytes", () => {
    expect(bytesToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))).toBe("0xdeadbeef");
  });

  it("includes 0x prefix", () => {
    const result = bytesToHex(new Uint8Array([0xff]));
    expect(result.startsWith("0x")).toBe(true);
  });

  it("zero-pads single-digit hex values", () => {
    expect(bytesToHex(new Uint8Array([0x01]))).toBe("0x01");
    expect(bytesToHex(new Uint8Array([0x00]))).toBe("0x00");
  });
});

describe("hexToBytes", () => {
  it("parses hex with 0x prefix", () => {
    const result = hexToBytes("0xdeadbeef");
    expect(result).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
  });

  it("parses hex without 0x prefix", () => {
    const result = hexToBytes("deadbeef");
    expect(result).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
  });

  it("returns empty array for stripped empty string", () => {
    const result = hexToBytes("0x");
    expect(result).toEqual(new Uint8Array(0));
  });

  it("returns empty array for empty string", () => {
    const result = hexToBytes("");
    expect(result).toEqual(new Uint8Array(0));
  });

  it("returns null for odd-length hex", () => {
    expect(hexToBytes("0xabc")).toBeNull();
  });

  it("returns null for invalid hex characters", () => {
    expect(hexToBytes("0xgg")).toBeNull();
    expect(hexToBytes("0xzzzz")).toBeNull();
  });

  it("parses valid hex string", () => {
    const result = hexToBytes("0x0102ff");
    expect(result).toEqual(new Uint8Array([0x01, 0x02, 0xff]));
  });
});

describe("tryDecodeUtf8", () => {
  it("decodes valid UTF-8 hex to string", () => {
    // "hello" = 68 65 6c 6c 6f
    expect(tryDecodeUtf8("0x68656c6c6f")).toBe("hello");
  });

  it("returns null for invalid hex", () => {
    expect(tryDecodeUtf8("0xgg")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(tryDecodeUtf8("")).toBeNull();
  });

  it("returns null for empty hex (0x only)", () => {
    // hexToBytes("0x") returns empty Uint8Array with length 0 => null
    expect(tryDecodeUtf8("0x")).toBeNull();
  });

  it("returns null for control characters", () => {
    // 0x01 is SOH control character
    expect(tryDecodeUtf8("0x01")).toBeNull();
  });

  it("allows tab characters (0x09)", () => {
    // tab is allowed (not in the rejection regex)
    expect(tryDecodeUtf8("0x09")).toBe("\t");
  });

  it("allows newline characters (0x0a)", () => {
    expect(tryDecodeUtf8("0x0a")).toBe("\n");
  });

  it("returns null for bytes that aren't valid UTF-8", () => {
    // 0xff 0xfe is not valid UTF-8
    expect(tryDecodeUtf8("0xfffe")).toBeNull();
  });
});

describe("base64ToBytes", () => {
  it("decodes valid base64", () => {
    // "hello" in base64 is "aGVsbG8="
    const result = base64ToBytes("aGVsbG8=");
    expect(result).toEqual(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]));
  });

  it("returns null for invalid base64", () => {
    expect(base64ToBytes("!!!invalid!!!")).toBeNull();
  });
});

describe("bytesToBase64", () => {
  it("encodes bytes to base64", () => {
    const bytes = new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
    expect(bytesToBase64(bytes)).toBe("aGVsbG8=");
  });

  it("roundtrips with base64ToBytes", () => {
    const original = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const b64 = bytesToBase64(original);
    const decoded = base64ToBytes(b64);
    expect(decoded).toEqual(original);
  });

  it("encodes empty array", () => {
    expect(bytesToBase64(new Uint8Array([]))).toBe("");
  });
});
