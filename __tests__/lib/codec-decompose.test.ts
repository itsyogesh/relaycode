import {
  patchValueAtPath,
  decomposeArgHex,
  HexLeafNode,
  HexCompoundNode,
} from "../../lib/codec";
import { createMockDedotClient } from "../helpers/mock-client";

describe("patchValueAtPath", () => {
  it("returns newValue when path is empty", () => {
    expect(patchValueAtPath("old", [], "new")).toBe("new");
    expect(patchValueAtPath(42, [], "replaced")).toBe("replaced");
  });

  it("patches a top-level array index", () => {
    const root = ["a", "b", "c"];
    const result = patchValueAtPath(root, [1], "B") as string[];
    expect(result).toEqual(["a", "B", "c"]);
    // Immutability: original unchanged
    expect(root).toEqual(["a", "b", "c"]);
  });

  it("patches a top-level object key", () => {
    const root = { foo: 1, bar: 2 };
    const result = patchValueAtPath(root, ["foo"], 99) as Record<string, number>;
    expect(result).toEqual({ foo: 99, bar: 2 });
    expect(root).toEqual({ foo: 1, bar: 2 });
  });

  it("patches a nested path [number, string]", () => {
    const root = [{ name: "Alice" }, { name: "Bob" }];
    const result = patchValueAtPath(root, [1, "name"], "Charlie");
    expect(result).toEqual([{ name: "Alice" }, { name: "Charlie" }]);
  });

  it("patches a deep nested path", () => {
    const root = { a: [{ b: { c: "old" } }] };
    const result = patchValueAtPath(root, ["a", 0, "b", "c"], "new");
    expect(result).toEqual({ a: [{ b: { c: "new" } }] });
  });

  it("creates intermediate arrays for number keys on undefined", () => {
    const root = undefined;
    const result = patchValueAtPath(root, [2], "val");
    expect(result).toEqual([undefined, undefined, "val"]);
  });

  it("creates intermediate objects for string keys on undefined", () => {
    const root = undefined;
    const result = patchValueAtPath(root, ["x", "y"], "val");
    expect(result).toEqual({ x: { y: "val" } });
  });

  it("handles mixed path on null root", () => {
    const result = patchValueAtPath(null, ["arr", 0], "val");
    expect(result).toEqual({ arr: ["val"] });
  });
});

describe("HexTreeNode types", () => {
  it("leaf node shape", () => {
    const leaf: HexLeafNode = { kind: "leaf" };
    expect(leaf.kind).toBe("leaf");
  });

  it("compound node shape", () => {
    const compound: HexCompoundNode = {
      kind: "compound",
      compoundType: "Sequence",
      children: [
        { label: "[0]", typeId: 1, hex: "0x01" },
        { label: "[1]", typeId: 1, hex: "0x02", children: { kind: "leaf" } },
      ],
    };
    expect(compound.kind).toBe("compound");
    expect(compound.children).toHaveLength(2);
    expect(compound.children[1].children?.kind).toBe("leaf");
  });
});

// ---------------------------------------------------------------------------
// decomposeArgHex - extended tests
// ---------------------------------------------------------------------------
describe("decomposeArgHex (extended)", () => {
  it("returns leaf for SizedVec with u8 inner type", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn().mockReturnValue({
          tryEncode: jest.fn(),
          tryDecode: jest.fn(),
        }),
        findType: jest.fn().mockImplementation((typeId: number) => {
          if (typeId === 1) {
            return {
              typeDef: { type: "SizedVec", value: { typeParam: 2, len: 32 } },
            };
          }
          // inner type is u8 → treated as fixed-size bytes
          return {
            typeDef: { type: "Primitive", value: { kind: "u8" } },
          };
        }),
      },
    });
    const result = decomposeArgHex(client, 1, [1, 2, 3]);
    expect(result.kind).toBe("leaf");
  });

  it("decomposes SizedVec with non-u8 inner type as compound", () => {
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
              typeDef: { type: "SizedVec", value: { typeParam: 2, len: 3 } },
            };
          }
          // inner type is u32, not u8
          return {
            typeDef: { type: "Primitive", value: { kind: "u32" } },
          };
        }),
      },
    });
    const result = decomposeArgHex(client, 1, [10, 20, 30]);
    expect(result.kind).toBe("compound");
    if (result.kind === "compound") {
      expect(result.compoundType).toBe("SizedVec");
      expect(result.children).toHaveLength(3);
      expect(result.children[0].label).toBe("[0]");
      expect(result.children[2].label).toBe("[2]");
    }
  });

  it("decomposes Enum multi-field variant as compound with multiple children", () => {
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
                  name: "Split",
                  fields: [
                    { name: "own", typeId: 10 },
                    { name: "nominator", typeId: 20 },
                  ],
                  index: 0,
                },
              ],
            },
          },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, {
      type: "Split",
      value: { own: 50, nominator: 50 },
    });
    expect(result.kind).toBe("compound");
    if (result.kind === "compound") {
      expect(result.compoundType).toBe("Enum");
      expect(result.children).toHaveLength(2);
      expect(result.children[0].label).toBe("Split.own");
      expect(result.children[1].label).toBe("Split.nominator");
    }
  });

  it("returns leaf when findType throws an error", () => {
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

  it("returns leaf for Enum with no matching variant", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn(),
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: {
              members: [
                { name: "Id", fields: [{ typeId: 0 }], index: 0 },
              ],
            },
          },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, {
      type: "NonExistentVariant",
      value: "foo",
    });
    expect(result.kind).toBe("leaf");
  });

  it("returns leaf for Enum variant with no value (simple enum)", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn(),
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: {
              members: [
                { name: "Staked", fields: [], index: 0 },
              ],
            },
          },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, { type: "Staked" });
    expect(result.kind).toBe("leaf");
  });

  it("returns leaf for Struct when value is not an object", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn(),
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Struct",
            value: {
              fields: [{ name: "a", typeId: 1 }],
            },
          },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, "not-an-object");
    expect(result.kind).toBe("leaf");
  });

  it("returns leaf for Tuple when value is not an array", () => {
    const client = createMockDedotClient({
      registry: {
        findCodec: jest.fn(),
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Tuple",
            value: { fields: [10, 20] },
          },
        }),
      },
    });
    const result = decomposeArgHex(client, 1, "not-an-array");
    expect(result.kind).toBe("leaf");
  });
});
