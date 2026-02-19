// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

import {
  createSectionOptions,
  createMethodOptions,
  getArgType,
} from "../../lib/parser";
import { createMockDedotClient } from "../helpers/mock-client";

describe("createSectionOptions", () => {
  it("should return null when metadata is null", () => {
    expect(createSectionOptions(null)).toBeNull();
  });

  it("should filter pallets without calls", () => {
    const mockMetadata = {
      pallets: [
        { index: 0, name: "System", calls: 1, docs: ["System pallet"] },
        { index: 1, name: "Timestamp", calls: null, docs: ["No calls"] },
        { index: 2, name: "Balances", calls: 2, docs: ["Balances pallet"] },
      ],
    } as any;

    const result = createSectionOptions(mockMetadata);
    expect(result).toHaveLength(2);
    expect(result?.map((p) => p.text)).toEqual(["Balances", "System"]);
  });

  it("should sort pallets alphabetically by name", () => {
    const mockMetadata = {
      pallets: [
        { index: 2, name: "Utility", calls: 1, docs: [] },
        { index: 0, name: "Balances", calls: 2, docs: [] },
        { index: 1, name: "System", calls: 3, docs: [] },
      ],
    } as any;

    const result = createSectionOptions(mockMetadata);
    expect(result?.map((p) => p.text)).toEqual([
      "Balances",
      "System",
      "Utility",
    ]);
  });

  it("should include pallet index and docs", () => {
    const mockMetadata = {
      pallets: [
        {
          index: 5,
          name: "Staking",
          calls: 10,
          docs: ["Staking pallet documentation"],
        },
      ],
    } as any;

    const result = createSectionOptions(mockMetadata);
    expect(result).toEqual([
      {
        value: 5,
        text: "Staking",
        docs: ["Staking pallet documentation"],
      },
    ]);
  });

  it("should handle empty pallets array", () => {
    const mockMetadata = {
      pallets: [],
    } as any;

    const result = createSectionOptions(mockMetadata);
    expect(result).toEqual([]);
  });

  it("should handle pallets with typeId-based calls", () => {
    const mockMetadata = {
      pallets: [
        { index: 0, name: "Test", calls: { typeId: 123 }, docs: [] },
      ],
    } as any;

    const result = createSectionOptions(mockMetadata);
    expect(result).toHaveLength(1);
    expect(result?.[0].text).toBe("Test");
  });
});

// ---------------------------------------------------------------------------
// createMethodOptions
// ---------------------------------------------------------------------------
describe("createMethodOptions", () => {
  it("returns method options for a pallet with numeric calls typeId", () => {
    const client = createMockDedotClient({
      metadata: {
        latest: {
          pallets: [
            { index: 5, name: "Balances", calls: 42, docs: [] },
          ],
        },
      },
      registry: {
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: {
              members: [
                { name: "transfer_allow_death", index: 0 },
                { name: "force_transfer", index: 2 },
              ],
            },
          },
        }),
        findCodec: jest.fn(),
        getEnumOptions: jest.fn(),
      },
    });

    const result = createMethodOptions(client, 5);
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { text: "transfer_allow_death", value: 0 },
      { text: "force_transfer", value: 2 },
    ]);
  });

  it("returns method options for a pallet with object calls ({typeId})", () => {
    const client = createMockDedotClient({
      metadata: {
        latest: {
          pallets: [
            { index: 3, name: "System", calls: { typeId: 10 }, docs: [] },
          ],
        },
      },
      registry: {
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: {
              members: [{ name: "remark", index: 0 }],
            },
          },
        }),
        findCodec: jest.fn(),
        getEnumOptions: jest.fn(),
      },
    });

    const result = createMethodOptions(client, 3);
    expect(result).toHaveLength(1);
    expect(result![0].text).toBe("remark");
  });

  it("returns null when pallet is not found", () => {
    const client = createMockDedotClient({
      metadata: {
        latest: {
          pallets: [
            { index: 1, name: "System", calls: 10, docs: [] },
          ],
        },
      },
      registry: {
        findType: jest.fn(),
        findCodec: jest.fn(),
        getEnumOptions: jest.fn(),
      },
    });

    const result = createMethodOptions(client, 999);
    expect(result).toBeNull();
  });

  it("returns null when pallet has no calls", () => {
    const client = createMockDedotClient({
      metadata: {
        latest: {
          pallets: [
            { index: 1, name: "Timestamp", calls: null, docs: [] },
          ],
        },
      },
      registry: {
        findType: jest.fn(),
        findCodec: jest.fn(),
        getEnumOptions: jest.fn(),
      },
    });

    const result = createMethodOptions(client, 1);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getArgType
// ---------------------------------------------------------------------------
describe("getArgType", () => {
  it("returns mapped member details for Enum type", () => {
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: {
              members: [
                {
                  name: "Id",
                  fields: [
                    { typeId: 0, typeName: "AccountId", docs: ["doc1"] },
                  ],
                  index: 0,
                  docs: ["Id variant"],
                },
                {
                  name: "Raw",
                  fields: [
                    { typeId: 14, typeName: "Vec<u8>", docs: [] },
                  ],
                  index: 2,
                  docs: [],
                },
              ],
            },
          },
        }),
        findCodec: jest.fn().mockReturnValue({}),
        getEnumOptions: jest.fn().mockReturnValue([]),
      },
    });

    const result = getArgType(client, 113);
    expect(result.type).toBe("Enum");
    expect(result.value.members).toHaveLength(2);
    expect(result.value.members[0].name).toBe("Id");
    expect(result.value.members[0].fields[0].typeId).toBe(0);
    expect(result.value.members[0].fields[0].typeName).toBe("AccountId");
    expect(result.value.members[1].name).toBe("Raw");
  });

  it("returns typeDef directly for non-Enum type", () => {
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        }),
        findCodec: jest.fn().mockReturnValue({}),
        getEnumOptions: jest.fn(),
      },
    });

    const result = getArgType(client, 1);
    expect(result).toEqual({ type: "Primitive", value: { kind: "u32" } });
  });

  it("returns typeDef for Struct type", () => {
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Struct",
            value: {
              fields: [
                { name: "amount", typeId: 5, typeName: "Balance" },
              ],
            },
          },
        }),
        findCodec: jest.fn().mockReturnValue({}),
        getEnumOptions: jest.fn(),
      },
    });

    const result = getArgType(client, 50);
    expect(result.type).toBe("Struct");
  });

  it("returns typeDef for Sequence type", () => {
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockReturnValue({
          typeDef: { type: "Sequence", value: { typeParam: 3 } },
        }),
        findCodec: jest.fn().mockReturnValue({}),
        getEnumOptions: jest.fn(),
      },
    });

    const result = getArgType(client, 14);
    expect(result).toEqual({ type: "Sequence", value: { typeParam: 3 } });
  });

  it("returns Enum with empty members array", () => {
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: { members: [] },
          },
        }),
        findCodec: jest.fn().mockReturnValue({}),
        getEnumOptions: jest.fn().mockReturnValue([]),
      },
    });

    const result = getArgType(client, 1);
    expect(result.type).toBe("Enum");
    expect(result.value.members).toEqual([]);
  });

  it("maps only typeId, typeName, and docs from Enum fields", () => {
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockReturnValue({
          typeDef: {
            type: "Enum",
            value: {
              members: [
                {
                  name: "Test",
                  fields: [
                    {
                      typeId: 5,
                      typeName: "Balance",
                      docs: ["field doc"],
                      extraProp: "should not appear",
                    },
                  ],
                  index: 0,
                  docs: ["variant doc"],
                  extraProp: "should not appear",
                },
              ],
            },
          },
        }),
        findCodec: jest.fn().mockReturnValue({}),
        getEnumOptions: jest.fn().mockReturnValue([]),
      },
    });

    const result = getArgType(client, 1);
    const member = result.value.members[0];
    expect(member).toEqual({
      name: "Test",
      fields: [{ typeId: 5, typeName: "Balance", docs: ["field doc"] }],
      index: 0,
      docs: ["variant doc"],
    });
    // Ensure extra properties are not present
    expect(member).not.toHaveProperty("extraProp");
  });
});
