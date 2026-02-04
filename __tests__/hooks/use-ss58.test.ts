// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

import { renderHook, act } from "@testing-library/react";
import { useSS58 } from "../../hooks/use-ss58";

// Sample addresses for testing
const POLKADOT_ADDRESS = "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5";
const KUSAMA_ADDRESS = "HNZata7iMYWmk5RvZRTiAsSDhV8366zq2YGb3tLH5Upf74F";
const GENERIC_ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

describe("useSS58", () => {
  describe("when client is null", () => {
    it("should use default ss58Prefix of 42", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.ss58Prefix).toBe(42);
    });

    it("should provide isValidAddress function", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(typeof result.current.isValidAddress).toBe("function");
    });

    it("should provide formatAddress function", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(typeof result.current.formatAddress).toBe("function");
    });

    it("should provide truncateAddress function", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(typeof result.current.truncateAddress).toBe("function");
    });
  });

  describe("isValidAddress", () => {
    it("should return true for valid SS58 addresses", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.isValidAddress(GENERIC_ADDRESS)).toBe(true);
      expect(result.current.isValidAddress(POLKADOT_ADDRESS)).toBe(true);
    });

    it("should return false for empty string", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.isValidAddress("")).toBe(false);
    });

    it("should return false for invalid addresses", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.isValidAddress("invalid")).toBe(false);
      // Note: dedot's decodeAddress accepts hex strings
    });

    it("should handle hex-formatted addresses", () => {
      const { result } = renderHook(() => useSS58(null));
      // dedot's decodeAddress accepts hex addresses
      expect(result.current.isValidAddress("0x1234")).toBe(true);
    });
  });

  describe("formatAddress", () => {
    it("should return null for empty string", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.formatAddress("")).toBeNull();
    });

    it("should return null for invalid address", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.formatAddress("invalid")).toBeNull();
    });

    it("should format valid address with ss58Prefix", () => {
      const { result } = renderHook(() => useSS58(null));
      const formatted = result.current.formatAddress(GENERIC_ADDRESS);
      expect(formatted).not.toBeNull();
      expect(typeof formatted).toBe("string");
      // With prefix 42, it should be a valid SS58 address
      expect(formatted?.length).toBeGreaterThan(40);
    });
  });

  describe("truncateAddress", () => {
    it("should truncate long addresses", () => {
      const { result } = renderHook(() => useSS58(null));
      const truncated = result.current.truncateAddress(GENERIC_ADDRESS);
      expect(truncated).toMatch(/^.{6}\.\.\..{6}$/);
    });

    it("should return short addresses unchanged", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.truncateAddress("short")).toBe("short");
      expect(result.current.truncateAddress("123456789012")).toBe("123456789012");
    });

    it("should handle empty string", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.truncateAddress("")).toBe("");
    });
  });

  describe("with mock client", () => {
    it("should use client ss58Prefix when available", () => {
      const mockClient = {
        consts: {
          system: {
            ss58Prefix: 0, // Polkadot prefix
          },
        },
      } as any;

      const { result } = renderHook(() => useSS58(mockClient));
      expect(result.current.ss58Prefix).toBe(0);
    });

    it("should fallback to 42 if ss58Prefix throws", () => {
      const mockClient = {
        consts: {
          system: {
            get ss58Prefix() {
              throw new Error("Not available");
            },
          },
        },
      } as any;

      const { result } = renderHook(() => useSS58(mockClient));
      expect(result.current.ss58Prefix).toBe(42);
    });
  });
});
