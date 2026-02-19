jest.mock("../../../env.mjs", () => ({ env: {} }));

const mockFetchValidators = jest.fn();
const mockFetchNominationPools = jest.fn();

jest.mock("../../../lib/api/subscan", () => ({
  fetchValidators: (...args: any[]) => mockFetchValidators(...args),
  fetchNominationPools: (...args: any[]) => mockFetchNominationPools(...args),
}));

import { fetchStakingContext } from "../../../lib/pallet-context/staking";
import { createMockDedotClient } from "../../helpers/mock-client";

const tokenMeta = { tokenSymbol: "DOT", tokenDecimals: 10 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchStakingContext", () => {
  it("returns validators, pools, eras, and tokenMeta", async () => {
    mockFetchValidators.mockResolvedValue([]);
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          currentEra: jest.fn().mockResolvedValue(100),
          activeEra: jest.fn().mockResolvedValue({ index: 99 }),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.type).toBe("staking");
    expect(result.validators).toEqual([]);
    expect(result.pools).toEqual([]);
    expect(result.currentEra).toBe(100);
    expect(result.activeEra).toBe(99);
    expect(result.tokenSymbol).toBe("DOT");
    expect(result.tokenDecimals).toBe(10);
  });
});

describe("fetchValidatorsWithFallback", () => {
  it("resolves identity with parent_display and sub_symbol", async () => {
    mockFetchValidators.mockResolvedValue([
      {
        stash_account_display: {
          address: "5Alice",
          people: {
            display: "Alice",
            parent_display: "ParentOrg",
            sub_symbol: "alice",
            identity: true,
          },
        },
        validator_prefs_value: 50_000_000,
        bonded_total: "1000000000000",
        count_nominators: 10,
        status: "",
      },
    ]);
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          currentEra: jest.fn().mockResolvedValue(null),
          activeEra: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.validators).toHaveLength(1);
    const v = result.validators[0];
    expect(v.address).toBe("5Alice");
    expect(v.identity).toBe("ParentOrg/alice");
    expect(v.isVerified).toBe(true);
    expect(v.commission).toBe(5);
    expect(v.totalStake).toBe("1000000000000");
    expect(v.nominatorCount).toBe(10);
    expect(v.isActive).toBe(true);
  });

  it("resolves identity without parent_display", async () => {
    mockFetchValidators.mockResolvedValue([
      {
        stash_account_display: {
          address: "5Bob",
          people: { display: "Bob", identity: false },
        },
        validator_prefs_value: 100_000_000,
        bonded_total: "500",
        count_nominators: 3,
        status: "waiting",
      },
    ]);
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          currentEra: jest.fn().mockResolvedValue(null),
          activeEra: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.validators[0].identity).toBe("Bob");
    expect(result.validators[0].isVerified).toBe(false);
    expect(result.validators[0].isActive).toBe(false);
  });

  it("resolves identity when no people object exists", async () => {
    mockFetchValidators.mockResolvedValue([
      {
        stash_account_display: { address: "5Carol" },
        validator_prefs_value: 0,
        bonded_total: "100",
        count_nominators: 0,
      },
    ]);
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          currentEra: jest.fn().mockResolvedValue(null),
          activeEra: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.validators[0].identity).toBeUndefined();
  });

  it("falls back to RPC when API fails", async () => {
    mockFetchValidators.mockRejectedValue(new Error("API down"));
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          validators: {
            entries: jest.fn().mockResolvedValue([
              ["5Dave", { commission: 200_000_000 }],
            ]),
          },
          currentEra: jest.fn().mockResolvedValue(null),
          activeEra: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.validators).toHaveLength(1);
    expect(result.validators[0].address).toBe("5Dave");
    expect(result.validators[0].commission).toBe(20);
    expect(result.validators[0].isActive).toBe(true);
  });

  it("returns empty when both API and RPC fail", async () => {
    mockFetchValidators.mockRejectedValue(new Error("API down"));
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          validators: {
            entries: jest.fn().mockRejectedValue(new Error("RPC down")),
          },
          currentEra: jest.fn().mockResolvedValue(null),
          activeEra: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.validators).toEqual([]);
  });
});

describe("fetchPoolsWithFallback", () => {
  it("maps API pool fields correctly", async () => {
    mockFetchValidators.mockResolvedValue([]);
    mockFetchNominationPools.mockResolvedValue([
      {
        pool_id: 1,
        metadata: "PoolOne",
        state: "Open",
        member_count: 25,
        total_bonded: "5000000000000",
        pool_account: { address: "5Pool1" },
      },
    ]);
    const client = createMockDedotClient({
      query: {
        staking: {
          currentEra: jest.fn().mockResolvedValue(null),
          activeEra: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.pools).toHaveLength(1);
    const p = result.pools[0];
    expect(p.id).toBe(1);
    expect(p.name).toBe("PoolOne");
    expect(p.state).toBe("Open");
    expect(p.memberCount).toBe(25);
    expect(p.totalStake).toBe("5000000000000");
    expect(p.depositor).toBe("5Pool1");
  });

  it("falls back to RPC and joins metadata map", async () => {
    mockFetchValidators.mockResolvedValue([]);
    mockFetchNominationPools.mockRejectedValue(new Error("API down"));
    const client = createMockDedotClient({
      query: {
        nominationPools: {
          bondedPools: {
            entries: jest.fn().mockResolvedValue([
              [
                1,
                {
                  state: { type: "Open" },
                  memberCounter: 5,
                  roles: { depositor: "5Dep1" },
                },
              ],
            ]),
          },
          metadata: {
            entries: jest.fn().mockResolvedValue([
              [1, new Uint8Array([80, 111, 111, 108, 49])], // "Pool1"
            ]),
          },
        },
        staking: {
          currentEra: jest.fn().mockResolvedValue(null),
          activeEra: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.pools).toHaveLength(1);
    expect(result.pools[0].name).toBe("Pool1");
    expect(result.pools[0].state).toBe("Open");
    expect(result.pools[0].memberCount).toBe(5);
    expect(result.pools[0].depositor).toBe("5Dep1");
  });

  it("returns empty when both API and RPC fail", async () => {
    mockFetchValidators.mockResolvedValue([]);
    mockFetchNominationPools.mockRejectedValue(new Error("API down"));
    const client = createMockDedotClient({
      query: {
        nominationPools: {
          bondedPools: {
            entries: jest.fn().mockRejectedValue(new Error("RPC down")),
          },
        },
        staking: {
          currentEra: jest.fn().mockResolvedValue(null),
          activeEra: jest.fn().mockResolvedValue(null),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.pools).toEqual([]);
  });
});

describe("fetchEras", () => {
  it("returns currentEra and activeEra from RPC", async () => {
    mockFetchValidators.mockResolvedValue([]);
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          currentEra: jest.fn().mockResolvedValue(200),
          activeEra: jest.fn().mockResolvedValue({ index: 199 }),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.currentEra).toBe(200);
    expect(result.activeEra).toBe(199);
  });

  it("handles activeEra without index property", async () => {
    mockFetchValidators.mockResolvedValue([]);
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          currentEra: jest.fn().mockResolvedValue(50),
          activeEra: jest.fn().mockResolvedValue(49),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.currentEra).toBe(50);
    expect(result.activeEra).toBe(49);
  });

  it("returns empty object when era queries fail", async () => {
    mockFetchValidators.mockResolvedValue([]);
    mockFetchNominationPools.mockResolvedValue([]);
    const client = createMockDedotClient({
      query: {
        staking: {
          currentEra: jest.fn().mockRejectedValue(new Error("fail")),
          activeEra: jest.fn().mockRejectedValue(new Error("fail")),
        },
      },
    });

    const result = await fetchStakingContext(client, "polkadot", tokenMeta);

    expect(result.currentEra).toBeUndefined();
    expect(result.activeEra).toBeUndefined();
  });
});
