// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

const originalEnv = { ...process.env };

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SUPPORTED_CHAINS;
  delete process.env.NEXT_PUBLIC_DEFAULT_CHAIN;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

import { getSupportedChains } from "../../config/get-supported-chains";

describe("getSupportedChains", () => {
  it("returns parsed NEXT_PUBLIC_SUPPORTED_CHAINS when set", () => {
    process.env.NEXT_PUBLIC_SUPPORTED_CHAINS = JSON.stringify([
      "polkadot",
      "kusama",
      "westend",
    ]);
    const result = getSupportedChains();
    expect(result).toEqual(["polkadot", "kusama", "westend"]);
  });

  it("falls back to [NEXT_PUBLIC_DEFAULT_CHAIN] when SUPPORTED_CHAINS is not set", () => {
    process.env.NEXT_PUBLIC_DEFAULT_CHAIN = "polkadot";
    const result = getSupportedChains();
    expect(result).toEqual(["polkadot"]);
  });

  it("throws on invalid JSON in NEXT_PUBLIC_SUPPORTED_CHAINS", () => {
    process.env.NEXT_PUBLIC_SUPPORTED_CHAINS = "not-valid-json";
    expect(() => getSupportedChains()).toThrow();
  });

  it("returns [undefined] when no env vars are set", () => {
    const result = getSupportedChains();
    expect(result).toEqual([undefined]);
  });

  it("prefers NEXT_PUBLIC_SUPPORTED_CHAINS over NEXT_PUBLIC_DEFAULT_CHAIN", () => {
    process.env.NEXT_PUBLIC_SUPPORTED_CHAINS = JSON.stringify(["kusama"]);
    process.env.NEXT_PUBLIC_DEFAULT_CHAIN = "polkadot";
    const result = getSupportedChains();
    expect(result).toEqual(["kusama"]);
  });
});
