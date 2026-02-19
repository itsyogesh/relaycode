jest.mock("../../../env.mjs", () => ({ env: {} }));

import { fetchMultisigContext } from "../../../lib/pallet-context/multisig";
import { createMockDedotClient } from "../../helpers/mock-client";

const tokenMeta = { tokenSymbol: "DOT", tokenDecimals: 10 };

describe("fetchMultisigContext", () => {
  it("returns pendingMultisigs and tokenMeta", async () => {
    const client = createMockDedotClient({
      query: {
        multisig: {
          multisigs: {
            entries: jest.fn().mockResolvedValue([]),
          },
        },
      },
    });

    const result = await fetchMultisigContext(client, "polkadot", tokenMeta);

    expect(result.type).toBe("multisig");
    expect(result.pendingMultisigs).toEqual([]);
    expect(result.tokenSymbol).toBe("DOT");
    expect(result.tokenDecimals).toBe(10);
  });
});

describe("fetchPendingMultisigs", () => {
  it("handles string call hash in key[1]", async () => {
    const client = createMockDedotClient({
      query: {
        multisig: {
          multisigs: {
            entries: jest.fn().mockResolvedValue([
              [
                ["5Alice", "0xabcdef"],
                {
                  approvals: ["5Bob", "5Carol"],
                  threshold: 2,
                  depositor: "5Alice",
                  when: { height: 1000, index: 3 },
                },
              ],
            ]),
          },
        },
      },
    });

    const result = await fetchMultisigContext(client, "polkadot", tokenMeta);

    expect(result.pendingMultisigs).toHaveLength(1);
    const m = result.pendingMultisigs[0];
    expect(m.callHash).toBe("0xabcdef");
    expect(m.approvals).toEqual(["5Bob", "5Carol"]);
    expect(m.threshold).toBe(2);
    expect(m.depositor).toBe("5Alice");
    expect(m.when).toEqual({ height: 1000, index: 3 });
  });

  it("handles Uint8Array call hash in key[1]", async () => {
    const hashBytes = new Uint8Array([0xab, 0xcd, 0xef]);
    const client = createMockDedotClient({
      query: {
        multisig: {
          multisigs: {
            entries: jest.fn().mockResolvedValue([
              [
                ["5Alice", hashBytes],
                {
                  approvals: [],
                  threshold: 3,
                  depositor: "5Alice",
                  when: { height: 500, index: 1 },
                },
              ],
            ]),
          },
        },
      },
    });

    const result = await fetchMultisigContext(client, "polkadot", tokenMeta);

    expect(result.pendingMultisigs[0].callHash).toBe("0xabcdef");
  });

  it("skips entries with null value", async () => {
    const client = createMockDedotClient({
      query: {
        multisig: {
          multisigs: {
            entries: jest.fn().mockResolvedValue([
              [["5Alice", "0x01"], null],
              [
                ["5Bob", "0x02"],
                {
                  approvals: [],
                  threshold: 2,
                  depositor: "5Bob",
                  when: { height: 100, index: 0 },
                },
              ],
            ]),
          },
        },
      },
    });

    const result = await fetchMultisigContext(client, "polkadot", tokenMeta);

    expect(result.pendingMultisigs).toHaveLength(1);
    expect(result.pendingMultisigs[0].depositor).toBe("5Bob");
  });

  it("returns empty when no multisig query exists", async () => {
    const client = createMockDedotClient({ query: {} });

    const result = await fetchMultisigContext(client, "polkadot", tokenMeta);

    expect(result.pendingMultisigs).toEqual([]);
  });

  it("returns empty on error", async () => {
    const client = createMockDedotClient({
      query: {
        multisig: {
          multisigs: {
            entries: jest.fn().mockRejectedValue(new Error("fail")),
          },
        },
      },
    });

    const result = await fetchMultisigContext(client, "polkadot", tokenMeta);

    expect(result.pendingMultisigs).toEqual([]);
  });
});
