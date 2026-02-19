jest.mock("../../../env.mjs", () => ({ env: {} }));

const mockFetchReferenda = jest.fn();
const mockFetchBounties = jest.fn();

jest.mock("../../../lib/api/polkassembly", () => ({
  fetchReferenda: (...args: any[]) => mockFetchReferenda(...args),
  fetchBounties: (...args: any[]) => mockFetchBounties(...args),
}));

import { fetchGovernanceContext } from "../../../lib/pallet-context/governance";
import { createMockDedotClient } from "../../helpers/mock-client";

const tokenMeta = { tokenSymbol: "DOT", tokenDecimals: 10 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchGovernanceContext", () => {
  it("returns complete context with referenda, tracks, bounties, and tokenMeta", async () => {
    mockFetchReferenda.mockResolvedValue([]);
    mockFetchBounties.mockResolvedValue([]);
    const client = createMockDedotClient({
      consts: { referenda: { tracks: [] } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.type).toBe("governance");
    expect(result.referenda).toEqual([]);
    expect(result.tracks).toEqual([]);
    expect(result.bounties).toEqual([]);
    expect(result.tokenSymbol).toBe("DOT");
    expect(result.tokenDecimals).toBe(10);
  });
});

describe("fetchReferendaWithFallback", () => {
  it("maps API fields correctly on success", async () => {
    mockFetchReferenda.mockResolvedValue([
      {
        post_id: 42,
        title: "Fund proposal",
        status: "Deciding",
        track_no: 1,
        track_name: "SmallSpender",
        proposer: "5GrwvaEF...",
        tally: { ayes: "100", nays: "50", support: "75" },
        created_at: "2024-01-01",
      },
    ]);
    mockFetchBounties.mockResolvedValue([]);
    const client = createMockDedotClient({
      consts: { referenda: { tracks: [] } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.referenda).toHaveLength(1);
    const ref = result.referenda[0];
    expect(ref.index).toBe(42);
    expect(ref.title).toBe("Fund proposal");
    expect(ref.status).toBe("Deciding");
    expect(ref.trackId).toBe(1);
    expect(ref.trackName).toBe("SmallSpender");
    expect(ref.proposer).toBe("5GrwvaEF...");
    expect(ref.tally).toEqual({ ayes: "100", nays: "50", support: "75" });
    expect(ref.createdAt).toBe("2024-01-01");
  });

  it("falls back to RPC when API fails", async () => {
    mockFetchReferenda.mockRejectedValue(new Error("API down"));
    mockFetchBounties.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        referenda: {
          referendumInfoFor: {
            entries: jest.fn().mockResolvedValue([
              [
                10,
                {
                  type: "Ongoing",
                  value: {
                    track: 2,
                    submissionDeposit: { who: "5Alice" },
                    tally: {
                      ayes: BigInt(1000),
                      nays: BigInt(500),
                      support: BigInt(200),
                    },
                  },
                },
              ],
            ]),
          },
        },
      },
      consts: { referenda: { tracks: [] } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.referenda).toHaveLength(1);
    expect(result.referenda[0].index).toBe(10);
    expect(result.referenda[0].status).toBe("Ongoing");
    expect(result.referenda[0].trackId).toBe(2);
    expect(result.referenda[0].proposer).toBe("5Alice");
  });

  it("filters to Ongoing referenda only in RPC fallback", async () => {
    mockFetchReferenda.mockRejectedValue(new Error("API down"));
    mockFetchBounties.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        referenda: {
          referendumInfoFor: {
            entries: jest.fn().mockResolvedValue([
              [1, { type: "Ongoing", value: { track: 0 } }],
              [2, { type: "Approved", value: {} }],
              [3, { type: "Ongoing", value: { track: 1 } }],
            ]),
          },
        },
      },
      consts: { referenda: { tracks: [] } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.referenda).toHaveLength(2);
    expect(result.referenda.map((r: any) => r.index)).toEqual([1, 3]);
  });

  it("returns empty when both API and RPC fail", async () => {
    mockFetchReferenda.mockRejectedValue(new Error("API down"));
    mockFetchBounties.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        referenda: {
          referendumInfoFor: {
            entries: jest.fn().mockRejectedValue(new Error("RPC down")),
          },
        },
      },
      consts: { referenda: { tracks: [] } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.referenda).toEqual([]);
  });
});

describe("fetchTracksFromRpc", () => {
  it("maps track tuples correctly from consts", async () => {
    mockFetchReferenda.mockResolvedValue([]);
    mockFetchBounties.mockResolvedValue([]);
    const client = createMockDedotClient({
      consts: {
        referenda: {
          tracks: [
            [0, { name: "root", maxDeciding: 1 }],
            [1, { name: "whitelisted_caller", maxDeciding: 10 }],
          ],
        },
      },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.tracks).toHaveLength(2);
    expect(result.tracks[0]).toEqual({ id: 0, name: "root", maxDeciding: 1 });
    expect(result.tracks[1]).toEqual({
      id: 1,
      name: "whitelisted_caller",
      maxDeciding: 10,
    });
  });

  it("returns empty when tracks is not an array", async () => {
    mockFetchReferenda.mockResolvedValue([]);
    mockFetchBounties.mockResolvedValue([]);
    const client = createMockDedotClient({
      consts: { referenda: { tracks: "not-an-array" } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.tracks).toEqual([]);
  });

  it("returns empty when tracks access errors", async () => {
    mockFetchReferenda.mockResolvedValue([]);
    mockFetchBounties.mockResolvedValue([]);
    const client = createMockDedotClient({
      consts: {
        referenda: {
          get tracks(): any {
            throw new Error("bad consts");
          },
        },
      },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.tracks).toEqual([]);
  });
});

describe("fetchBountiesWithFallback", () => {
  it("maps API bounty fields correctly", async () => {
    mockFetchReferenda.mockResolvedValue([]);
    mockFetchBounties.mockResolvedValue([
      {
        post_id: 5,
        title: "Dev bounty",
        content: "A".repeat(300),
        reward: "10000000000",
        curator: "5Bob",
        status: "Active",
      },
    ]);
    const client = createMockDedotClient({
      consts: { referenda: { tracks: [] } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.bounties).toHaveLength(1);
    const b = result.bounties[0];
    expect(b.index).toBe(5);
    expect(b.title).toBe("Dev bounty");
    expect(b.description).toHaveLength(200);
    expect(b.value).toBe("10000000000");
    expect(b.curator).toBe("5Bob");
    expect(b.status).toBe("Active");
  });

  it("falls back to RPC when API fails", async () => {
    mockFetchReferenda.mockResolvedValue([]);
    mockFetchBounties.mockRejectedValue(new Error("API down"));
    const client = createMockDedotClient({
      query: {
        bounties: {
          bounties: {
            entries: jest.fn().mockResolvedValue([
              [
                7,
                {
                  value: BigInt(500000),
                  status: { type: "Funded", value: { curator: "5Carol" } },
                },
              ],
            ]),
          },
        },
      },
      consts: { referenda: { tracks: [] } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.bounties).toHaveLength(1);
    expect(result.bounties[0].index).toBe(7);
    expect(result.bounties[0].value).toBe("500000");
    expect(result.bounties[0].curator).toBe("5Carol");
    expect(result.bounties[0].status).toBe("Funded");
  });

  it("returns empty when both API and RPC fail", async () => {
    mockFetchReferenda.mockResolvedValue([]);
    mockFetchBounties.mockRejectedValue(new Error("API down"));
    const client = createMockDedotClient({
      query: {
        bounties: {
          bounties: {
            entries: jest.fn().mockRejectedValue(new Error("RPC down")),
          },
        },
      },
      consts: { referenda: { tracks: [] } },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.bounties).toEqual([]);
  });
});

describe("integration", () => {
  it("combines referenda, tracks, and bounties in a single context", async () => {
    mockFetchReferenda.mockResolvedValue([
      {
        post_id: 1,
        title: "Ref",
        status: "Deciding",
        track_no: 0,
        created_at: "2024-01-01",
      },
    ]);
    mockFetchBounties.mockResolvedValue([
      {
        post_id: 2,
        title: "Bounty",
        content: "desc",
        status: "Active",
      },
    ]);
    const client = createMockDedotClient({
      consts: {
        referenda: {
          tracks: [[0, { name: "root", maxDeciding: 1 }]],
        },
      },
    });

    const result = await fetchGovernanceContext(client, "polkadot", tokenMeta);

    expect(result.referenda).toHaveLength(1);
    expect(result.tracks).toHaveLength(1);
    expect(result.bounties).toHaveLength(1);
    expect(result.type).toBe("governance");
  });
});
