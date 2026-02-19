jest.mock("../../../env.mjs", () => ({ env: {} }));

import { fetchAssetsContext } from "../../../lib/pallet-context/assets";
import { createMockDedotClient } from "../../helpers/mock-client";

const tokenMeta = { tokenSymbol: "DOT", tokenDecimals: 10 };

describe("fetchAssetsContext", () => {
  it("returns assets and tokenMeta", async () => {
    const client = createMockDedotClient({
      query: {
        assets: {
          metadata: { entries: jest.fn().mockResolvedValue([]) },
          asset: { entries: jest.fn().mockResolvedValue([]) },
        },
      },
    });

    const result = await fetchAssetsContext(client, "polkadot", tokenMeta);

    expect(result.type).toBe("assets");
    expect(result.assets).toEqual([]);
    expect(result.tokenSymbol).toBe("DOT");
    expect(result.tokenDecimals).toBe(10);
  });
});

describe("fetchAssetsFromRpc", () => {
  it("maps metadata and asset entries correctly", async () => {
    const client = createMockDedotClient({
      query: {
        assets: {
          metadata: {
            entries: jest.fn().mockResolvedValue([
              [1, { name: "Tether USD", symbol: "USDT", decimals: 6 }],
            ]),
          },
          asset: {
            entries: jest.fn().mockResolvedValue([
              [
                1,
                {
                  supply: BigInt(1000000),
                  admin: "5Admin",
                  isFrozen: false,
                },
              ],
            ]),
          },
        },
      },
    });

    const result = await fetchAssetsContext(client, "polkadot", tokenMeta);

    expect(result.assets).toHaveLength(1);
    const a = result.assets[0];
    expect(a.id).toBe(1);
    expect(a.name).toBe("Tether USD");
    expect(a.symbol).toBe("USDT");
    expect(a.decimals).toBe(6);
    expect(a.totalSupply).toBe("1000000");
    expect(a.admin).toBe("5Admin");
    expect(a.isFrozen).toBe(false);
  });

  it("returns empty when no assets query exists", async () => {
    const client = createMockDedotClient({ query: {} });

    const result = await fetchAssetsContext(client, "polkadot", tokenMeta);

    expect(result.assets).toEqual([]);
  });

  it("extracts string name field", async () => {
    const client = createMockDedotClient({
      query: {
        assets: {
          metadata: {
            entries: jest.fn().mockResolvedValue([
              [10, { name: "StringName", symbol: "SN", decimals: 8 }],
            ]),
          },
          asset: {
            entries: jest.fn().mockResolvedValue([
              [10, { supply: BigInt(0) }],
            ]),
          },
        },
      },
    });

    const result = await fetchAssetsContext(client, "polkadot", tokenMeta);

    expect(result.assets[0].name).toBe("StringName");
  });

  it("extracts name from byte array", async () => {
    // "USDC" as byte array
    const nameBytes = [85, 83, 68, 67];
    const symbolBytes = [85, 67];
    const client = createMockDedotClient({
      query: {
        assets: {
          metadata: {
            entries: jest.fn().mockResolvedValue([
              [20, { name: nameBytes, symbol: symbolBytes, decimals: 6 }],
            ]),
          },
          asset: {
            entries: jest.fn().mockResolvedValue([
              [20, { supply: BigInt(0) }],
            ]),
          },
        },
      },
    });

    const result = await fetchAssetsContext(client, "polkadot", tokenMeta);

    expect(result.assets[0].name).toBe("USDC");
    expect(result.assets[0].symbol).toBe("UC");
  });

  it("extracts name from Uint8Array", async () => {
    const name = new Uint8Array([68, 65, 73]); // "DAI"
    const symbol = new Uint8Array([68]); // "D"
    const client = createMockDedotClient({
      query: {
        assets: {
          metadata: {
            entries: jest.fn().mockResolvedValue([
              [30, { name, symbol, decimals: 18 }],
            ]),
          },
          asset: {
            entries: jest.fn().mockResolvedValue([
              [30, { supply: BigInt(0) }],
            ]),
          },
        },
      },
    });

    const result = await fetchAssetsContext(client, "polkadot", tokenMeta);

    expect(result.assets[0].name).toBe("DAI");
    expect(result.assets[0].symbol).toBe("D");
  });

  it("returns empty on error", async () => {
    const client = createMockDedotClient({
      query: {
        assets: {
          metadata: {
            entries: jest.fn().mockRejectedValue(new Error("fail")),
          },
          asset: {
            entries: jest.fn().mockRejectedValue(new Error("fail")),
          },
        },
      },
    });

    const result = await fetchAssetsContext(client, "polkadot", tokenMeta);

    expect(result.assets).toEqual([]);
  });

  it("sorts assets by id", async () => {
    const client = createMockDedotClient({
      query: {
        assets: {
          metadata: {
            entries: jest.fn().mockResolvedValue([
              [30, { name: "C", symbol: "C", decimals: 0 }],
              [10, { name: "A", symbol: "A", decimals: 0 }],
              [20, { name: "B", symbol: "B", decimals: 0 }],
            ]),
          },
          asset: {
            entries: jest.fn().mockResolvedValue([
              [30, { supply: BigInt(0) }],
              [10, { supply: BigInt(0) }],
              [20, { supply: BigInt(0) }],
            ]),
          },
        },
      },
    });

    const result = await fetchAssetsContext(client, "polkadot", tokenMeta);

    expect(result.assets.map((a: any) => a.id)).toEqual([10, 20, 30]);
  });
});
