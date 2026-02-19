// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

import {
  encodeArg,
  encodeArgLegacy,
  encodeAllArgs,
  decodeArg,
  decodeArgLegacy,
  decodeAllArgs,
  decomposeArgHex,
} from "../../lib/codec";
import { createMockDedotClient } from "../helpers/mock-client";

// ---------------------------------------------------------------------------
// encodeArg
// ---------------------------------------------------------------------------
describe("encodeArg", () => {
  it("encodes successfully when codec.tryEncode works", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01, 0x02])),
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
      },
    });
    const result = encodeArg(client, 1, 42);
    expect(result.success).toBe(true);
    if (result.success) expect(result.hex).toBe("0x0102");
  });

  it("falls back to smartCoercion when basic encode fails", () => {
    let callCount = 0;
    const tryEncode = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) throw new Error("basic fail");
      // smartCoercion returns undefined for non-address, so it retries basic, which fails again
      throw new Error("still fails");
    });
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: {
              members: [{ name: "Id", fields: [{ typeId: 0 }] }],
            },
          },
        }),
      },
    });
    const result = encodeArg(client, 1, "not-an-address");
    expect(result.success).toBe(false);
  });

  it("returns error when both encoding attempts fail", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode: jest.fn().mockImplementation(() => {
            throw new Error("encode failed");
          }),
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
      },
    });
    const result = encodeArg(client, 1, "bad");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("encode failed");
  });

  // coerceValue tested indirectly
  it("coerces 'true' string to boolean true", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([1]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "bool" } },
        }),
      },
    });
    encodeArg(client, 1, "true");
    expect(tryEncode).toHaveBeenCalledWith(true);
  });

  it("coerces 'false' string to boolean false", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "bool" } },
        }),
      },
    });
    encodeArg(client, 1, "false");
    expect(tryEncode).toHaveBeenCalledWith(false);
  });

  it("coerces numeric string to BigInt", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u128" } },
        }),
      },
    });
    encodeArg(client, 1, "123");
    expect(tryEncode).toHaveBeenCalledWith(BigInt(123));
  });

  it("passes Uint8Array through without coercion", () => {
    const input = new Uint8Array([1, 2, 3]);
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([1, 2, 3]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u8" } },
        }),
      },
    });
    encodeArg(client, 1, input);
    expect(tryEncode).toHaveBeenCalledWith(input);
  });

  it("coerces nested objects recursively", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Struct", value: { fields: [] } },
        }),
      },
    });
    encodeArg(client, 1, { amount: "100", flag: "true" });
    expect(tryEncode).toHaveBeenCalledWith({ amount: BigInt(100), flag: true });
  });

  it("coerces arrays recursively", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Sequence", value: { typeParam: 0 } },
        }),
      },
    });
    encodeArg(client, 1, ["100", "200"]);
    expect(tryEncode).toHaveBeenCalledWith([BigInt(100), BigInt(200)]);
  });

  it("leaves non-numeric strings as strings", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "str" } },
        }),
      },
    });
    encodeArg(client, 1, "hello world");
    expect(tryEncode).toHaveBeenCalledWith("hello world");
  });
});

// ---------------------------------------------------------------------------
// encodeArgLegacy
// ---------------------------------------------------------------------------
describe("encodeArgLegacy", () => {
  it("returns hex string from encodeArg on success", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode: jest
            .fn()
            .mockReturnValue(new Uint8Array([0xab, 0xcd])),
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
      },
    });
    expect(encodeArgLegacy(client, 1, 42)).toBe("0xabcd");
  });

  it("returns '0x' on failure", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode: jest.fn().mockImplementation(() => {
            throw new Error("fail");
          }),
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
      },
    });
    expect(encodeArgLegacy(client, 1, "bad")).toBe("0x");
  });
});

// ---------------------------------------------------------------------------
// encodeAllArgs
// ---------------------------------------------------------------------------
describe("encodeAllArgs", () => {
  function makeEncodingClient(results: Record<number, Uint8Array>) {
    return createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockImplementation((typeId: number) => ({
          tryEncode: jest.fn().mockImplementation(() => {
            if (results[typeId]) return results[typeId];
            throw new Error(`no mock for typeId ${typeId}`);
          }),
          tryDecode: jest.fn(),
        })),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
      },
    });
  }

  it("encodes all fields successfully and concatenates hex", () => {
    const client = makeEncodingClient({
      10: new Uint8Array([0x01, 0x02]),
      20: new Uint8Array([0x03]),
    });
    const fields = [
      { name: "a", typeId: 10 },
      { name: "b", typeId: 20 },
    ];
    const result = encodeAllArgs(client, fields, { a: 1, b: 2 });
    expect(result.hasErrors).toBe(false);
    expect(result.argHexes).toEqual(["0x0102", "0x03"]);
    expect(result.concatenated).toBe("0x010203");
    expect(result.errors.size).toBe(0);
  });

  it("reports error for a failing field while encoding others", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockImplementation((typeId: number) => ({
          tryEncode: jest.fn().mockImplementation(() => {
            if (typeId === 10) return new Uint8Array([0xaa]);
            throw new Error("field error");
          }),
          tryDecode: jest.fn(),
        })),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
      },
    });
    const fields = [
      { name: "ok", typeId: 10 },
      { name: "bad", typeId: 99 },
    ];
    const result = encodeAllArgs(client, fields, { ok: 1, bad: "x" });
    expect(result.hasErrors).toBe(true);
    expect(result.errors.has("bad")).toBe(true);
    expect(result.argResults[0].success).toBe(true);
    expect(result.argResults[1].success).toBe(false);
  });

  it("returns 0x for empty fields", () => {
    const client = createMockDedotClient();
    const result = encodeAllArgs(client, [], {});
    expect(result.hasErrors).toBe(false);
    expect(result.concatenated).toBe("0x");
    expect(result.argResults).toEqual([]);
  });

  it("maps field names to formValues correctly", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0x01]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
      },
    });
    const fields = [
      { name: "dest", typeId: 1 },
      { name: "value", typeId: 1 },
    ];
    encodeAllArgs(client, fields, { dest: "alice", value: "100" });
    // First call: dest="alice" coerced stays "alice"
    // Second call: value="100" coerced to BigInt(100)
    expect(tryEncode).toHaveBeenCalledTimes(2);
  });

  it("handles fields with empty name", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0x05]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
      },
    });
    const fields = [{ typeId: 1 }]; // no name
    const result = encodeAllArgs(client, fields, { "": 42 });
    expect(result.hasErrors).toBe(false);
    expect(result.argHexes).toEqual(["0x05"]);
  });
});

// ---------------------------------------------------------------------------
// decodeArg
// ---------------------------------------------------------------------------
describe("decodeArg", () => {
  it("decodes successfully with bytesConsumed", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(42),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x2a, 0x00])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x2a00");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(42);
      expect(result.bytesConsumed).toBe(2);
    }
  });

  it("returns error on decode failure", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockImplementation(() => {
            throw new Error("decode failed");
          }),
          tryEncode: jest.fn(),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0xffff");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("decode failed");
  });

  // flattenDecodedValue tested through decodeArg
  it("flattens BigInt to string", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(BigInt(12345678901234)),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe("12345678901234");
  });

  it("flattens Uint8Array to hex string", () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(bytes),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe("0xdeadbeef");
  });

  it("flattens enum with inner value (e.g. MultiAddress Id)", () => {
    const enumVal = {
      type: "Id",
      value: new Uint8Array([0x01, 0x02]),
    };
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(enumVal),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    // enum with inner Uint8Array value → flatten inner → hex
    if (result.success) expect(result.value).toBe("0x0102");
  });

  it("preserves enum with no inner value (e.g. Staked)", () => {
    const enumVal = { type: "Staked" };
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(enumVal),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toEqual({ type: "Staked" });
  });

  it("flattens object with toJSON returning string", () => {
    const obj = {
      toJSON: () => "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      toString: () => "[object AccountId32]",
    };
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(obj),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.value).toBe(
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      );
  });

  it("flattens object with toJSON returning number → string", () => {
    const obj = { toJSON: () => 42 };
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(obj),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe("42");
  });

  it("flattens object with meaningful toString", () => {
    const obj = { toString: () => "meaningful-string" };
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(obj),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe("meaningful-string");
  });

  it("recursively flattens plain nested objects", () => {
    const obj = { a: BigInt(100), b: new Uint8Array([0xff]) };
    // Give it a default [object Object] toString so it falls through to field recursion
    Object.defineProperty(obj, "toString", {
      value: () => "[object Object]",
      enumerable: false,
    });
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(obj),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({ a: "100", b: "0xff" });
    }
  });

  it("flattens arrays recursively", () => {
    const arr = [BigInt(1), BigInt(2)];
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(arr),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x01");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toEqual(["1", "2"]);
  });

  it("passes null through flattenDecodedValue", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(null),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x00])),
        }),
        findType: jest.fn(),
      },
    });
    const result = decodeArg(client, 1, "0x00");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// decodeArgLegacy
// ---------------------------------------------------------------------------
describe("decodeArgLegacy", () => {
  it("returns decoded value on success", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(42),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x2a])),
        }),
        findType: jest.fn(),
      },
    });
    expect(decodeArgLegacy(client, 1, "0x2a")).toBe(42);
  });

  it("throws on decode failure", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockImplementation(() => {
            throw new Error("bad hex");
          }),
          tryEncode: jest.fn(),
        }),
        findType: jest.fn(),
      },
    });
    expect(() => decodeArgLegacy(client, 1, "0xzz")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// decodeAllArgs
// ---------------------------------------------------------------------------
describe("decodeAllArgs", () => {
  it("decodes multiple fields sequentially", () => {
    // Field A: 2 bytes, Field B: 1 byte
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockImplementation((typeId: number) => ({
          tryDecode: jest.fn().mockImplementation((bytes: Uint8Array) => {
            if (typeId === 10) return 0x0102;
            return 0x03;
          }),
          tryEncode: jest.fn().mockImplementation((val: unknown) => {
            if (typeId === 10) return new Uint8Array([0x01, 0x02]);
            return new Uint8Array([0x03]);
          }),
        })),
        findType: jest.fn(),
      },
    });
    const fields = [
      { name: "a", typeId: 10 },
      { name: "b", typeId: 20 },
    ];
    const result = decodeAllArgs(client, fields, "0x010203");
    expect(result.success).toBe(true);
    expect(result.values).toEqual({ a: 0x0102, b: 0x03 });
    expect(result.totalBytesConsumed).toBe(3);
  });

  it("returns error when a field decode fails mid-stream", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockImplementation((typeId: number) => ({
          tryDecode: jest.fn().mockImplementation(() => {
            if (typeId === 20) throw new Error("decode error");
            return 1;
          }),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        })),
        findType: jest.fn(),
      },
    });
    const fields = [
      { name: "ok", typeId: 10 },
      { name: "bad", typeId: 20 },
    ];
    const result = decodeAllArgs(client, fields, "0x0102");
    expect(result.success).toBe(false);
    expect(result.errors.has("bad")).toBe(true);
    expect(result.values).toBeNull();
  });

  it("returns error when remaining bytes are empty for a field", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(1),
          tryEncode: jest
            .fn()
            .mockReturnValue(new Uint8Array([0x01, 0x02])),
        }),
        findType: jest.fn(),
      },
    });
    const fields = [
      { name: "a", typeId: 1 },
      { name: "b", typeId: 1 },
    ];
    // Only 2 bytes, but first field consumes 2 → nothing left for second
    const result = decodeAllArgs(client, fields, "0x0102");
    expect(result.success).toBe(false);
    expect(result.errors.has("b")).toBe(true);
    expect(result.errors.get("b")).toContain("No more bytes");
  });

  it("warns on extra trailing bytes but still succeeds", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryDecode: jest.fn().mockReturnValue(1),
          tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x01])),
        }),
        findType: jest.fn(),
      },
    });
    const fields = [{ name: "a", typeId: 1 }];
    const result = decodeAllArgs(client, fields, "0x0102ff");
    expect(result.success).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("bytes remaining")
    );
    warnSpy.mockRestore();
  });

  it("returns global error on hex parse failure", () => {
    const client = createMockDedotClient();
    const fields = [{ name: "a", typeId: 1 }];
    // "0xZZZZ" is not valid hex, hexToU8a will throw
    const result = decodeAllArgs(client, fields, "not-hex");
    expect(result.success).toBe(false);
    expect(result.errors.has("_global")).toBe(true);
  });

  it("handles empty fields array", () => {
    const client = createMockDedotClient();
    const result = decodeAllArgs(client, [], "0x");
    expect(result.success).toBe(true);
    expect(result.values).toEqual({});
    expect(result.totalBytesConsumed).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// decomposeArgHex
// ---------------------------------------------------------------------------
describe("decomposeArgHex", () => {
  it("returns leaf at max depth", () => {
    const client = createMockDedotClient();
    const result = decomposeArgHex(client, 1, "anything", 4);
    expect(result.kind).toBe("leaf");
  });

  it("returns leaf for null/undefined/empty string", () => {
    const client = createMockDedotClient();
    expect(decomposeArgHex(client, 1, null).kind).toBe("leaf");
    expect(decomposeArgHex(client, 1, undefined).kind).toBe("leaf");
    expect(decomposeArgHex(client, 1, "").kind).toBe("leaf");
  });

  it("decomposes Sequence (non-bytes) with array value", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0x01]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockImplementation((typeId: number) => {
          if (typeId === 1) {
            return {
              typeDef: { type: "Sequence", value: { typeParam: 2 } },
            };
          }
          // inner type is not u8 (so not bytes)
          return {
            typeDef: { type: "Primitive", value: { kind: "u32" } },
          };
        }),
      },
    });
    const result = decomposeArgHex(client, 1, [10, 20]);
    expect(result.kind).toBe("compound");
    if (result.kind === "compound") {
      expect(result.compoundType).toBe("Sequence");
      expect(result.children).toHaveLength(2);
      expect(result.children[0].label).toBe("[0]");
      expect(result.children[1].label).toBe("[1]");
    }
  });

  it("returns leaf for Sequence that is bytes (Vec<u8>)", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode: jest.fn(),
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockImplementation((typeId: number) => {
          if (typeId === 1) {
            return {
              typeDef: { type: "Sequence", value: { typeParam: 2 } },
            };
          }
          // inner type IS u8
          return {
            typeDef: { type: "Primitive", value: { kind: "u8" } },
          };
        }),
      },
    });
    const result = decomposeArgHex(client, 1, [1, 2, 3]);
    expect(result.kind).toBe("leaf");
  });

  it("decomposes Struct with fields", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0x01]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Struct",
            value: {
              fields: [
                { name: "dest", typeId: 10 },
                { name: "value", typeId: 20 },
              ],
            },
          },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, {
      dest: "alice",
      value: "100",
    });
    expect(result.kind).toBe("compound");
    if (result.kind === "compound") {
      expect(result.compoundType).toBe("Struct");
      expect(result.children).toHaveLength(2);
      expect(result.children[0].label).toBe("dest");
      expect(result.children[1].label).toBe("value");
    }
  });

  it("decomposes Enum single-field variant", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0x01]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: {
              members: [
                {
                  name: "Id",
                  fields: [{ typeId: 0 }],
                  index: 0,
                },
              ],
            },
          },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, {
      type: "Id",
      value: "some-value",
    });
    expect(result.kind).toBe("compound");
    if (result.kind === "compound") {
      expect(result.compoundType).toBe("Enum");
      expect(result.children).toHaveLength(1);
      expect(result.children[0].label).toBe("Id");
    }
  });

  it("decomposes Tuple with items", () => {
    const tryEncode = jest.fn().mockReturnValue(new Uint8Array([0x01]));
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode,
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Tuple",
            value: { fields: [10, 20] },
          },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, ["a", "b"]);
    expect(result.kind).toBe("compound");
    if (result.kind === "compound") {
      expect(result.compoundType).toBe("Tuple");
      expect(result.children).toHaveLength(2);
      expect(result.children[0].label).toBe("[0]");
      expect(result.children[1].label).toBe("[1]");
    }
  });

  it("returns leaf when findType throws", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn(),
        findType: jest.fn().mockImplementation(() => {
          throw new Error("type not found");
        }),
      },
    });
    const result = decomposeArgHex(client, 999, "some-value");
    expect(result.kind).toBe("leaf");
  });

  it("returns leaf for Compact type", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn(),
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Compact", value: { typeParam: 5 } },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, BigInt(100));
    expect(result.kind).toBe("leaf");
  });
});
