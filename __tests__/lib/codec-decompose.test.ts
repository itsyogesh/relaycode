import { patchValueAtPath, HexLeafNode, HexCompoundNode } from "@/lib/codec";

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
