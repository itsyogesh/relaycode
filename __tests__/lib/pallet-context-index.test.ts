// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

const mockFetchGovernanceContext = jest.fn();
const mockFetchStakingContext = jest.fn();
const mockFetchProxyContext = jest.fn();
const mockFetchAssetsContext = jest.fn();
const mockFetchVestingContext = jest.fn();
const mockFetchCoretimeContext = jest.fn();
const mockFetchXcmContext = jest.fn();
const mockFetchMultisigContext = jest.fn();

jest.mock("../../lib/pallet-context/governance", () => ({
  fetchGovernanceContext: (...args: any[]) => mockFetchGovernanceContext(...args),
}));

jest.mock("../../lib/pallet-context/staking", () => ({
  fetchStakingContext: (...args: any[]) => mockFetchStakingContext(...args),
}));

jest.mock("../../lib/pallet-context/proxy", () => ({
  fetchProxyContext: (...args: any[]) => mockFetchProxyContext(...args),
}));

jest.mock("../../lib/pallet-context/assets", () => ({
  fetchAssetsContext: (...args: any[]) => mockFetchAssetsContext(...args),
}));

jest.mock("../../lib/pallet-context/vesting", () => ({
  fetchVestingContext: (...args: any[]) => mockFetchVestingContext(...args),
}));

jest.mock("../../lib/pallet-context/coretime", () => ({
  fetchCoretimeContext: (...args: any[]) => mockFetchCoretimeContext(...args),
}));

jest.mock("../../lib/pallet-context/xcm", () => ({
  fetchXcmContext: (...args: any[]) => mockFetchXcmContext(...args),
}));

jest.mock("../../lib/pallet-context/multisig", () => ({
  fetchMultisigContext: (...args: any[]) => mockFetchMultisigContext(...args),
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

  it("returns 'proxy' for Proxy", () => {
    expect(getContextGroup("Proxy")).toBe("proxy");
  });

  it("returns 'assets' for Assets", () => {
    expect(getContextGroup("Assets")).toBe("assets");
  });

  it("returns 'vesting' for Vesting", () => {
    expect(getContextGroup("Vesting")).toBe("vesting");
  });

  it("returns 'coretime' for Broker", () => {
    expect(getContextGroup("Broker")).toBe("coretime");
  });

  it("returns 'xcm' for XcmPallet", () => {
    expect(getContextGroup("XcmPallet")).toBe("xcm");
  });

  it("returns 'xcm' for PolkadotXcm", () => {
    expect(getContextGroup("PolkadotXcm")).toBe("xcm");
  });

  it("returns 'multisig' for Multisig", () => {
    expect(getContextGroup("Multisig")).toBe("multisig");
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

  it("calls fetchProxyContext for Proxy pallet", async () => {
    const proxyData = { type: "proxy" as const, proxyTypes: [], tokenSymbol: "DOT", tokenDecimals: 10 };
    mockFetchProxyContext.mockResolvedValue(proxyData);
    const client = createMockClient();

    const result = await fetchPalletContext(client, "Proxy", "polkadot");

    expect(mockFetchProxyContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
    expect(result).toBe(proxyData);
  });

  it("calls fetchAssetsContext for Assets pallet", async () => {
    const assetsData = { type: "assets" as const, assets: [], tokenSymbol: "DOT", tokenDecimals: 10 };
    mockFetchAssetsContext.mockResolvedValue(assetsData);
    const client = createMockClient();

    const result = await fetchPalletContext(client, "Assets", "polkadot");

    expect(mockFetchAssetsContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
    expect(result).toBe(assetsData);
  });

  it("calls fetchVestingContext for Vesting pallet", async () => {
    const vestingData = { type: "vesting" as const, tokenSymbol: "DOT", tokenDecimals: 10 };
    mockFetchVestingContext.mockResolvedValue(vestingData);
    const client = createMockClient();

    const result = await fetchPalletContext(client, "Vesting", "polkadot");

    expect(mockFetchVestingContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
    expect(result).toBe(vestingData);
  });

  it("calls fetchCoretimeContext for Broker pallet", async () => {
    const coretimeData = { type: "coretime" as const, cores: [], tokenSymbol: "DOT", tokenDecimals: 10 };
    mockFetchCoretimeContext.mockResolvedValue(coretimeData);
    const client = createMockClient();

    const result = await fetchPalletContext(client, "Broker", "polkadot");

    expect(mockFetchCoretimeContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
    expect(result).toBe(coretimeData);
  });

  it("calls fetchXcmContext for XcmPallet", async () => {
    const xcmData = { type: "xcm" as const, parachains: [], tokenSymbol: "DOT", tokenDecimals: 10 };
    mockFetchXcmContext.mockResolvedValue(xcmData);
    const client = createMockClient();

    const result = await fetchPalletContext(client, "XcmPallet", "polkadot");

    expect(mockFetchXcmContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
    expect(result).toBe(xcmData);
  });

  it("calls fetchXcmContext for PolkadotXcm", async () => {
    const xcmData = { type: "xcm" as const, parachains: [], tokenSymbol: "KSM", tokenDecimals: 12 };
    mockFetchXcmContext.mockResolvedValue(xcmData);
    const client = createMockClient({ tokenSymbol: "KSM", tokenDecimals: 12 });

    const result = await fetchPalletContext(client, "PolkadotXcm", "kusama");

    expect(mockFetchXcmContext).toHaveBeenCalledWith(
      client, "kusama", { tokenSymbol: "KSM", tokenDecimals: 12 }
    );
    expect(result).toBe(xcmData);
  });

  it("calls fetchMultisigContext for Multisig pallet", async () => {
    const multisigData = { type: "multisig" as const, pendingMultisigs: [], tokenSymbol: "DOT", tokenDecimals: 10 };
    mockFetchMultisigContext.mockResolvedValue(multisigData);
    const client = createMockClient();

    const result = await fetchPalletContext(client, "Multisig", "polkadot");

    expect(mockFetchMultisigContext).toHaveBeenCalledWith(
      client, "polkadot", { tokenSymbol: "DOT", tokenDecimals: 10 }
    );
    expect(result).toBe(multisigData);
  });
});
