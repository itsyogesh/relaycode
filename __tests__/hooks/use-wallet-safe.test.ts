// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

// Mock luno-kit/react hooks
const mockUseAccount = jest.fn();
const mockUseAccounts = jest.fn();
const mockUseBalance = jest.fn();

jest.mock("@luno-kit/react", () => ({
  useAccount: () => mockUseAccount(),
  useAccounts: () => mockUseAccounts(),
  useBalance: (opts: any) => mockUseBalance(opts),
}));

// Mock useLunoKitAvailable
let mockIsAvailable = true;
jest.mock("../../components/wallet/wallet-provider", () => ({
  useLunoKitAvailable: () => mockIsAvailable,
}));

import { renderHook } from "@testing-library/react";
import {
  useSafeAccount,
  useSafeAccounts,
  useSafeBalance,
} from "../../hooks/use-wallet-safe";

describe("useSafeAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAvailable = true;
  });

  it("returns address when isAvailable is true", () => {
    mockUseAccount.mockReturnValue({
      account: { address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
    });

    const { result } = renderHook(() => useSafeAccount());
    expect(result.current.address).toBe(
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    );
  });

  it("returns undefined address when isAvailable is false", () => {
    mockIsAvailable = false;
    mockUseAccount.mockReturnValue({
      account: { address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
    });

    const { result } = renderHook(() => useSafeAccount());
    expect(result.current.address).toBeUndefined();
  });

  it("returns undefined address when account is null", () => {
    mockUseAccount.mockReturnValue({ account: null });

    const { result } = renderHook(() => useSafeAccount());
    expect(result.current.address).toBeUndefined();
  });
});

describe("useSafeAccounts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAvailable = true;
  });

  it("returns accounts when available", () => {
    const accounts = [
      { address: "5GrwvaEF...", name: "Alice" },
      { address: "5FHneW46...", name: "Bob" },
    ];
    mockUseAccounts.mockReturnValue({ accounts });

    const { result } = renderHook(() => useSafeAccounts());
    expect(result.current.accounts).toBe(accounts);
    expect(result.current.accounts).toHaveLength(2);
  });

  it("returns empty accounts when not available", () => {
    mockIsAvailable = false;
    mockUseAccounts.mockReturnValue({
      accounts: [{ address: "5GrwvaEF...", name: "Alice" }],
    });

    const { result } = renderHook(() => useSafeAccounts());
    expect(result.current.accounts).toEqual([]);
  });
});

describe("useSafeBalance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAvailable = true;
  });

  it("returns flattened balance data when available", () => {
    mockUseBalance.mockReturnValue({
      data: {
        free: BigInt("10000000000"),
        transferable: BigInt("9000000000"),
        formattedTransferable: "0.9 DOT",
      },
    });

    const { result } = renderHook(() =>
      useSafeBalance({ address: "5GrwvaEF..." })
    );
    expect(result.current.free).toBe(BigInt("10000000000"));
    expect(result.current.transferable).toBe(BigInt("9000000000"));
    expect(result.current.formattedTransferable).toBe("0.9 DOT");
  });

  it("returns defaults when not available", () => {
    mockIsAvailable = false;
    mockUseBalance.mockReturnValue({
      data: {
        free: BigInt("10000000000"),
        transferable: BigInt("9000000000"),
        formattedTransferable: "0.9 DOT",
      },
    });

    const { result } = renderHook(() =>
      useSafeBalance({ address: "5GrwvaEF..." })
    );
    expect(result.current.free).toBeUndefined();
    expect(result.current.transferable).toBeUndefined();
    expect(result.current.formattedTransferable).toBeUndefined();
  });

  it("returns defaults when data is null", () => {
    mockUseBalance.mockReturnValue({ data: null });

    const { result } = renderHook(() =>
      useSafeBalance({ address: "5GrwvaEF..." })
    );
    expect(result.current.free).toBeUndefined();
    expect(result.current.transferable).toBeUndefined();
    expect(result.current.formattedTransferable).toBeUndefined();
  });
});
