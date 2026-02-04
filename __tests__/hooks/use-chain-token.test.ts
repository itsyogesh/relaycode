// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

import { renderHook, waitFor } from "@testing-library/react";
import { useChainToken } from "../../hooks/use-chain-token";

describe("useChainToken", () => {
  describe("when client is null", () => {
    it("should return default DOT values", () => {
      const { result } = renderHook(() => useChainToken(null));

      expect(result.current.symbol).toBe("DOT");
      expect(result.current.decimals).toBe(10);
      expect(result.current.existentialDeposit).toBe(BigInt("10000000000"));
    });

    it("should have denominations for DOT", () => {
      const { result } = renderHook(() => useChainToken(null));

      expect(result.current.denominations).toBeDefined();
      expect(result.current.denominations.length).toBeGreaterThan(0);
      expect(result.current.denominations[0].label).toBe("DOT");
    });

    it("should not be loading when client is null", async () => {
      const { result } = renderHook(() => useChainToken(null));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("with mock client", () => {
    it("should fetch token info from client", async () => {
      const mockClient = {
        chainSpec: {
          properties: jest.fn().mockResolvedValue({
            tokenDecimals: 12,
            tokenSymbol: "KSM",
          }),
        },
        consts: {
          balances: {
            existentialDeposit: BigInt("333333333"),
          },
        },
      } as any;

      const { result } = renderHook(() => useChainToken(mockClient));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.symbol).toBe("KSM");
      expect(result.current.decimals).toBe(12);
      expect(result.current.existentialDeposit).toBe(BigInt("333333333"));
    });

    it("should handle array values for tokenDecimals and tokenSymbol", async () => {
      const mockClient = {
        chainSpec: {
          properties: jest.fn().mockResolvedValue({
            tokenDecimals: [12, 10],
            tokenSymbol: ["KSM", "DOT"],
          }),
        },
        consts: {
          balances: {
            existentialDeposit: BigInt("100000000"),
          },
        },
      } as any;

      const { result } = renderHook(() => useChainToken(mockClient));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should use first element from arrays
      expect(result.current.symbol).toBe("KSM");
      expect(result.current.decimals).toBe(12);
    });

    it("should handle missing tokenDecimals", async () => {
      const mockClient = {
        chainSpec: {
          properties: jest.fn().mockResolvedValue({
            tokenSymbol: "TEST",
          }),
        },
        consts: {
          balances: {
            existentialDeposit: BigInt("1000"),
          },
        },
      } as any;

      const { result } = renderHook(() => useChainToken(mockClient));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fallback to 10 decimals
      expect(result.current.decimals).toBe(10);
    });

    it("should handle missing tokenSymbol", async () => {
      const mockClient = {
        chainSpec: {
          properties: jest.fn().mockResolvedValue({
            tokenDecimals: 8,
          }),
        },
        consts: {
          balances: {
            existentialDeposit: BigInt("1000"),
          },
        },
      } as any;

      const { result } = renderHook(() => useChainToken(mockClient));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fallback to UNIT
      expect(result.current.symbol).toBe("UNIT");
    });

    it("should handle fetch errors gracefully", async () => {
      const mockClient = {
        chainSpec: {
          properties: jest.fn().mockRejectedValue(new Error("Network error")),
        },
        consts: {
          balances: {
            existentialDeposit: BigInt("1000"),
          },
        },
      } as any;

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useChainToken(mockClient));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should keep default values on error
      expect(result.current.symbol).toBe("DOT");

      consoleSpy.mockRestore();
    });

    it("should update denominations when token info changes", async () => {
      const mockClient = {
        chainSpec: {
          properties: jest.fn().mockResolvedValue({
            tokenDecimals: 12,
            tokenSymbol: "KSM",
          }),
        },
        consts: {
          balances: {
            existentialDeposit: BigInt("333333333"),
          },
        },
      } as any;

      const { result } = renderHook(() => useChainToken(mockClient));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.denominations[0].label).toBe("KSM");
      expect(result.current.denominations[0].maxDecimals).toBe(12);
    });

    it("should set loading to true while fetching", () => {
      const mockClient = {
        chainSpec: {
          properties: jest.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
        },
        consts: {
          balances: {
            existentialDeposit: BigInt("1000"),
          },
        },
      } as any;

      const { result } = renderHook(() => useChainToken(mockClient));

      expect(result.current.loading).toBe(true);
    });
  });
});
