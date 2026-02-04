// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

import { createSectionOptions } from "../../lib/parser";

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

// Note: createMethodOptions and getArgType require a real DedotClient
// which cannot be easily mocked. Integration tests with a live client
// would be needed to test these functions properly.
