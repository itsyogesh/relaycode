jest.mock("../../../env.mjs", () => ({ env: {} }));

import { fetchCoretimeContext } from "../../../lib/pallet-context/coretime";
import { createMockDedotClient } from "../../helpers/mock-client";

const tokenMeta = { tokenSymbol: "DOT", tokenDecimals: 10 };

describe("fetchCoretimeContext", () => {
  it("returns cores, currentPrice, and tokenMeta", async () => {
    const client = createMockDedotClient({
      query: {
        broker: {
          workplan: { entries: jest.fn().mockResolvedValue([]) },
          status: jest.fn().mockResolvedValue(null),
          saleInfo: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.type).toBe("coretime");
    expect(result.cores).toEqual([]);
    expect(result.currentPrice).toBeUndefined();
    expect(result.tokenSymbol).toBe("DOT");
    expect(result.tokenDecimals).toBe(10);
  });
});

describe("fetchCoresFromRpc", () => {
  it("populates core set from workplan entries", async () => {
    const client = createMockDedotClient({
      query: {
        broker: {
          workplan: {
            entries: jest.fn().mockResolvedValue([
              [[0, 100], {}],
              [[2, 100], {}],
              [[0, 101], {}],
            ]),
          },
          status: jest.fn().mockResolvedValue(null),
          saleInfo: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.cores).toHaveLength(2);
    expect(result.cores.map((c: any) => c.core)).toEqual([0, 2]);
  });

  it("fills missing cores from status coreCount", async () => {
    const client = createMockDedotClient({
      query: {
        broker: {
          workplan: {
            entries: jest.fn().mockResolvedValue([[[1, 100], {}]]),
          },
          status: jest.fn().mockResolvedValue({ coreCount: 3 }),
          saleInfo: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.cores).toHaveLength(3);
    expect(result.cores.map((c: any) => c.core)).toEqual([0, 1, 2]);
  });

  it("returns empty when no broker query exists", async () => {
    const client = createMockDedotClient({ query: {} });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.cores).toEqual([]);
  });

  it("returns empty on error", async () => {
    const client = createMockDedotClient({
      query: {
        broker: {
          workplan: {
            entries: jest.fn().mockRejectedValue(new Error("fail")),
          },
          saleInfo: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.cores).toEqual([]);
  });
});

describe("fetchCurrentPrice", () => {
  it("returns price from saleInfo", async () => {
    const client = createMockDedotClient({
      query: {
        broker: {
          workplan: { entries: jest.fn().mockResolvedValue([]) },
          status: jest.fn().mockResolvedValue(null),
          saleInfo: jest
            .fn()
            .mockResolvedValue({ price: BigInt(50000000000) }),
        },
      },
    });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.currentPrice).toBe("50000000000");
  });

  it("returns endPrice when price is missing", async () => {
    const client = createMockDedotClient({
      query: {
        broker: {
          workplan: { entries: jest.fn().mockResolvedValue([]) },
          status: jest.fn().mockResolvedValue(null),
          saleInfo: jest
            .fn()
            .mockResolvedValue({ endPrice: BigInt(30000000000) }),
        },
      },
    });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.currentPrice).toBe("30000000000");
  });

  it("returns undefined when no saleInfo", async () => {
    const client = createMockDedotClient({
      query: {
        broker: {
          workplan: { entries: jest.fn().mockResolvedValue([]) },
          status: jest.fn().mockResolvedValue(null),
          saleInfo: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.currentPrice).toBeUndefined();
  });

  it("returns undefined on error", async () => {
    const client = createMockDedotClient({
      query: {
        broker: {
          workplan: { entries: jest.fn().mockResolvedValue([]) },
          status: jest.fn().mockResolvedValue(null),
          saleInfo: jest.fn().mockRejectedValue(new Error("fail")),
        },
      },
    });

    const result = await fetchCoretimeContext(client, "polkadot", tokenMeta);

    expect(result.currentPrice).toBeUndefined();
  });
});
