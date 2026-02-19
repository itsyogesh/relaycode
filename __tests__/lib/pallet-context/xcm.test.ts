jest.mock("../../../env.mjs", () => ({ env: {} }));

import { fetchXcmContext } from "../../../lib/pallet-context/xcm";
import { createMockDedotClient } from "../../helpers/mock-client";

const tokenMeta = { tokenSymbol: "DOT", tokenDecimals: 10 };

describe("fetchXcmContext", () => {
  it("uses POLKADOT_PARACHAINS registry for polkadot network", async () => {
    const client = createMockDedotClient({
      query: {
        hrmp: {
          hrmpChannels: { entries: jest.fn().mockResolvedValue([]) },
        },
      },
    });

    const result = await fetchXcmContext(client, "polkadot", tokenMeta);

    expect(result.type).toBe("xcm");
    expect(result.tokenSymbol).toBe("DOT");
    // Polkadot registry should contain Asset Hub (Polkadot)
    const names = result.parachains.map((p: any) => p.name);
    expect(names).toContain("Asset Hub (Polkadot)");
    expect(names).not.toContain("Asset Hub (Kusama)");
  });

  it("uses KUSAMA_PARACHAINS registry for kusama network", async () => {
    const client = createMockDedotClient({
      query: {
        hrmp: {
          hrmpChannels: { entries: jest.fn().mockResolvedValue([]) },
        },
      },
    });

    const result = await fetchXcmContext(client, "kusama", tokenMeta);

    const names = result.parachains.map((p: any) => p.name);
    expect(names).toContain("Asset Hub (Kusama)");
    expect(names).not.toContain("Asset Hub (Polkadot)");
  });

  it("defaults to polkadot registry for unknown network", async () => {
    const client = createMockDedotClient({
      query: {
        hrmp: {
          hrmpChannels: { entries: jest.fn().mockResolvedValue([]) },
        },
      },
    });

    const result = await fetchXcmContext(client, "westend", tokenMeta);

    const names = result.parachains.map((p: any) => p.name);
    expect(names).toContain("Asset Hub (Polkadot)");
  });

  it("filters to active HRMP channels keeping system chains", async () => {
    const client = createMockDedotClient({
      query: {
        hrmp: {
          hrmpChannels: {
            entries: jest.fn().mockResolvedValue([
              [{ sender: 2004, recipient: 1000 }, {}],
              [{ sender: 1000, recipient: 2004 }, {}],
            ]),
          },
        },
      },
    });

    const result = await fetchXcmContext(client, "polkadot", tokenMeta);

    // Should keep system chains (paraId < 2000) + only active non-system (2004 = Moonbeam)
    const paraIds = result.parachains.map((p: any) => p.paraId);
    // System chains (< 2000) should all be present
    expect(paraIds).toContain(1000);
    expect(paraIds).toContain(1001);
    // Active channel parachain should be present
    expect(paraIds).toContain(2004);
    // Non-active non-system parachain should be filtered out
    expect(paraIds).not.toContain(2000); // Acala not in channels
  });

  it("returns full registry when no hrmp query exists", async () => {
    const client = createMockDedotClient({ query: {} });

    const result = await fetchXcmContext(client, "polkadot", tokenMeta);

    // Should return full polkadot registry
    expect(result.parachains.length).toBeGreaterThan(5);
    const paraIds = result.parachains.map((p: any) => p.paraId);
    expect(paraIds).toContain(2000); // Acala should be present when unfiltered
  });

  it("returns full registry when hrmp query errors", async () => {
    const client = createMockDedotClient({
      query: {
        hrmp: {
          hrmpChannels: {
            entries: jest.fn().mockRejectedValue(new Error("fail")),
          },
        },
      },
    });

    const result = await fetchXcmContext(client, "polkadot", tokenMeta);

    expect(result.parachains.length).toBeGreaterThan(5);
  });

  it("returns full registry when HRMP channels are empty", async () => {
    const client = createMockDedotClient({
      query: {
        hrmp: {
          hrmpChannels: { entries: jest.fn().mockResolvedValue([]) },
        },
      },
    });

    const result = await fetchXcmContext(client, "polkadot", tokenMeta);

    // Empty channels → set is empty → returns full registry (no filtering)
    expect(result.parachains.length).toBeGreaterThan(5);
  });
});
