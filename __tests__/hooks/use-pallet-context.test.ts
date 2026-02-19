// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

// Mock @luno-kit/react useChain
let mockGenesisHash: string | undefined =
  "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3";
jest.mock("@luno-kit/react", () => ({
  useChain: () => ({
    chain: mockGenesisHash ? { genesisHash: mockGenesisHash } : null,
  }),
}));

// Mock pallet-context functions
const mockGetContextGroup = jest.fn();
const mockFetchPalletContext = jest.fn();
jest.mock("../../lib/pallet-context", () => ({
  getContextGroup: (...args: any[]) => mockGetContextGroup(...args),
  fetchPalletContext: (...args: any[]) => mockFetchPalletContext(...args),
}));

// Mock networkFromGenesisHash
jest.mock("../../types/pallet-context", () => ({
  networkFromGenesisHash: (hash: string) => {
    if (
      hash ===
      "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3"
    )
      return "polkadot";
    if (
      hash ===
      "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe"
    )
      return "kusama";
    return "polkadot";
  },
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import { usePalletContext } from "../../hooks/use-pallet-context";

// Access the module-level contextCache for clearing between tests.
// We access it through the module's internal state by doing a direct clear
// via a helper: changing the genesisHash between tests forces cache keys to differ.
// But for true isolation, we increment the genesisHash prefix for each test group.

function createMockClient() {
  return { mock: true } as any;
}

const mockGovernanceData = {
  type: "governance" as const,
  referenda: [],
  tracks: [],
  bounties: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

// We use unique genesis hashes per test to avoid cache collisions between tests
// since the module-level contextCache Map persists across tests in the same file.
let testId = 0;
function uniqueGenesisHash() {
  testId++;
  return `0x${testId.toString().padStart(64, "0")}`;
}

describe("usePalletContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContextGroup.mockReturnValue("governance");
    mockFetchPalletContext.mockResolvedValue(mockGovernanceData);
    // Use a unique genesis hash per test for cache isolation
    mockGenesisHash = uniqueGenesisHash();
  });

  it("returns null context when no client", async () => {
    const { result } = renderHook(() =>
      usePalletContext(null, "ConvictionVoting")
    );

    await waitFor(() => {
      expect(result.current.context).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockFetchPalletContext).not.toHaveBeenCalled();
  });

  it("returns null when no palletName", async () => {
    const client = createMockClient();
    const { result } = renderHook(() =>
      usePalletContext(client, undefined)
    );

    await waitFor(() => {
      expect(result.current.context).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockFetchPalletContext).not.toHaveBeenCalled();
  });

  it("returns null when getContextGroup returns undefined", async () => {
    mockGetContextGroup.mockReturnValue(undefined);
    const client = createMockClient();

    const { result } = renderHook(() =>
      usePalletContext(client, "Balances")
    );

    await waitFor(() => {
      expect(result.current.context).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockFetchPalletContext).not.toHaveBeenCalled();
  });

  it("fetches data and returns it on success", async () => {
    const client = createMockClient();

    const { result } = renderHook(() =>
      usePalletContext(client, "ConvictionVoting")
    );

    await waitFor(() => {
      expect(result.current.context).toEqual(mockGovernanceData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
    expect(mockFetchPalletContext).toHaveBeenCalledTimes(1);
  });

  it("returns cached data when switching between pallets in the same context group", async () => {
    // Both ConvictionVoting and Referenda map to "governance" group,
    // so they share a cache key. After the first fetch, switching to
    // another governance pallet should use the cache.
    const client = createMockClient();

    // Start with ConvictionVoting
    const { result, rerender } = renderHook(
      ({ pallet }: { pallet: string }) => usePalletContext(client, pallet),
      { initialProps: { pallet: "ConvictionVoting" } }
    );

    await waitFor(() => {
      expect(result.current.context).toEqual(mockGovernanceData);
    });
    expect(mockFetchPalletContext).toHaveBeenCalledTimes(1);

    // Switch to Referenda (same governance group, same cache key)
    rerender({ pallet: "Referenda" });

    await waitFor(() => {
      expect(result.current.context).toEqual(mockGovernanceData);
    });

    // Should NOT have fetched again (cache hit for same group:genesisHash)
    expect(mockFetchPalletContext).toHaveBeenCalledTimes(1);
  });

  it("sets error state on fetch failure", async () => {
    mockFetchPalletContext.mockRejectedValue(new Error("Network error"));
    const client = createMockClient();

    const { result } = renderHook(() =>
      usePalletContext(client, "ConvictionVoting")
    );

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
      expect(result.current.context).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("sets generic error when thrown value is not an Error", async () => {
    mockFetchPalletContext.mockRejectedValue("some string error");
    const client = createMockClient();

    const { result } = renderHook(() =>
      usePalletContext(client, "ConvictionVoting")
    );

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to fetch context");
    });
  });

  it("re-fetches when palletName changes", async () => {
    const stakingData = {
      type: "staking" as const,
      validators: [],
      pools: [],
      tokenSymbol: "DOT",
      tokenDecimals: 10,
    };
    const client = createMockClient();

    // Use a unique context group for "staking"
    let palletName = "ConvictionVoting";
    const { result, rerender } = renderHook(
      ({ pallet }: { pallet: string }) => usePalletContext(client, pallet),
      { initialProps: { pallet: palletName } }
    );

    await waitFor(() => {
      expect(result.current.context).toEqual(mockGovernanceData);
    });

    // Change pallet
    mockGetContextGroup.mockReturnValue("staking");
    mockFetchPalletContext.mockResolvedValue(stakingData);
    rerender({ pallet: "Staking" });

    await waitFor(() => {
      expect(result.current.context).toEqual(stakingData);
    });
    expect(mockFetchPalletContext).toHaveBeenCalledTimes(2);
  });

  it("provides a refetch function in the return value", async () => {
    const client = createMockClient();

    const { result } = renderHook(() =>
      usePalletContext(client, "ConvictionVoting")
    );

    await waitFor(() => {
      expect(typeof result.current.refetch).toBe("function");
    });
  });

  it("clears context on chain switch (genesisHash change)", async () => {
    const client = createMockClient();
    const hash1 = uniqueGenesisHash();
    mockGenesisHash = hash1;

    const { result, rerender } = renderHook(() =>
      usePalletContext(client, "ConvictionVoting")
    );

    await waitFor(() => {
      expect(result.current.context).toEqual(mockGovernanceData);
    });

    // Simulate chain switch by changing genesisHash
    const newData = { ...mockGovernanceData, tokenSymbol: "KSM" };
    mockFetchPalletContext.mockResolvedValue(newData);
    mockGenesisHash = uniqueGenesisHash();
    rerender();

    await waitFor(() => {
      // After chain switch the context should update with new fetch
      expect(result.current.context).toEqual(newData);
    });
  });

  it("returns isLoading=true while fetch is in progress", async () => {
    // Create a promise we can control
    let resolvePromise!: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockFetchPalletContext.mockReturnValue(pendingPromise);
    const client = createMockClient();

    const { result } = renderHook(() =>
      usePalletContext(client, "ConvictionVoting")
    );

    // Should be loading while the fetch is in progress
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise(mockGovernanceData);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.context).toEqual(mockGovernanceData);
    });
  });
});
