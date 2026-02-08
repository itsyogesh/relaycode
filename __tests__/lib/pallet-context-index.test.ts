// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

const mockFetchGovernanceContext = jest.fn();
const mockFetchStakingContext = jest.fn();

jest.mock("../../lib/pallet-context/governance", () => ({
  fetchGovernanceContext: (...args: any[]) => mockFetchGovernanceContext(...args),
}));

jest.mock("../../lib/pallet-context/staking", () => ({
  fetchStakingContext: (...args: any[]) => mockFetchStakingContext(...args),
}));

import { getContextGroup, fetchPalletContext } from "../../lib/pallet-context/index";

function createMockClient(overrides: {
  tokenDecimals?: number | number[];
  tokenSymbol?: string | string[];
  shouldThrow?: boolean;
} = {}) {
  const { tokenDecimals = 10, tokenSymbol = "DOT", shouldThrow = false } = overrides;
  return {
    chainSpec: {
      properties: shouldThrow
        ? jest.fn().mockRejectedValue(new Error("chain error"))
        : jest.fn().mockResolvedValue({ tokenDecimals, tokenSymbol }),
    },
  } as any;
}

describe("getContextGroup", () => {
  it("returns 'governance' for ConvictionVoting", () => {
    expect(getContextGroup("ConvictionVoting")).toBe("governance");
  });

  it("returns 'governance' for Referenda", () => {
    expect(getContextGroup("Referenda")).toBe("governance");
  });

  it("returns 'governance' for Bounties", () => {
    expect(getContextGroup("Bounties")).toBe("governance");
  });

  it("returns 'governance' for Treasury", () => {
    expect(getContextGroup("Treasury")).toBe("governance");
  });

  it("returns 'staking' for Staking", () => {
    expect(getContextGroup("Staking")).toBe("staking");
  });

  it("returns 'staking' for NominationPools", () => {
    expect(getContextGroup("NominationPools")).toBe("staking");
  });

  it("returns undefined for unmapped pallets", () => {
    expect(getContextGroup("Balances")).toBeUndefined();
    expect(getContextGroup("System")).toBeUndefined();
  });
});

describe("fetchPalletContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls fetchGovernanceContext for governance pallets", async () => {
    const govData = { type: "governance" as const, referenda: [], tracks: [], bounties: [], tokenSymbol: "DOT", tokenDecimals: 10 };
    mockFetchGovernanceContext.mockResolvedValue(govData);
    const client = createMockClient();

    const result = await fetchPalletContext(client, "ConvictionVoting", "polkadot");

    expect(mockFetchGovernanceContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
    expect(result).toBe(govData);
  });

  it("calls fetchStakingContext for staking pallets", async () => {
    const stakingData = { type: "staking" as const, validators: [], pools: [], tokenSymbol: "DOT", tokenDecimals: 10 };
    mockFetchStakingContext.mockResolvedValue(stakingData);
    const client = createMockClient();

    const result = await fetchPalletContext(client, "Staking", "polkadot");

    expect(mockFetchStakingContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
    expect(result).toBe(stakingData);
  });

  it("returns null for unmapped pallets", async () => {
    const client = createMockClient();
    const result = await fetchPalletContext(client, "Balances", "polkadot");

    expect(result).toBeNull();
    expect(mockFetchGovernanceContext).not.toHaveBeenCalled();
    expect(mockFetchStakingContext).not.toHaveBeenCalled();
  });

  it("handles array tokenDecimals (uses first element)", async () => {
    mockFetchGovernanceContext.mockResolvedValue({});
    const client = createMockClient({ tokenDecimals: [12, 10], tokenSymbol: "KSM" });

    await fetchPalletContext(client, "Referenda", "kusama");

    expect(mockFetchGovernanceContext).toHaveBeenCalledWith(
      client, "kusama", { tokenSymbol: "KSM", tokenDecimals: 12 }
    );
  });

  it("handles array tokenSymbol (uses first element)", async () => {
    mockFetchGovernanceContext.mockResolvedValue({});
    const client = createMockClient({ tokenDecimals: 10, tokenSymbol: ["DOT", "LDOT"] });

    await fetchPalletContext(client, "Treasury", "polkadot");

    expect(mockFetchGovernanceContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
  });

  it("defaults to DOT/10 when chainSpec.properties() throws", async () => {
    mockFetchStakingContext.mockResolvedValue({});
    const client = createMockClient({ shouldThrow: true });

    await fetchPalletContext(client, "NominationPools", "polkadot");

    expect(mockFetchStakingContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
  });

  it("passes tokenMeta through to governance fetcher", async () => {
    mockFetchGovernanceContext.mockResolvedValue({});
    const client = createMockClient({ tokenDecimals: 12, tokenSymbol: "KSM" });

    await fetchPalletContext(client, "Bounties", "kusama");

    expect(mockFetchGovernanceContext).toHaveBeenCalledWith(
      client, "kusama", { tokenSymbol: "KSM", tokenDecimals: 12 }
    );
  });

  it("passes tokenMeta through to staking fetcher", async () => {
    mockFetchStakingContext.mockResolvedValue({});
    const client = createMockClient({ tokenDecimals: 10, tokenSymbol: "DOT" });

    await fetchPalletContext(client, "Staking", "polkadot");

    expect(mockFetchStakingContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
  });
});
