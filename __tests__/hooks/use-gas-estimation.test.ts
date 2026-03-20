jest.mock("../../env.mjs", () => ({ env: {} }));

jest.mock("../../lib/chain-types", () => ({
  hasReviveApi: jest.fn(),
}));

import { renderHook, act } from "@testing-library/react";
import { useGasEstimation } from "../../hooks/use-gas-estimation";
import { hasReviveApi } from "../../lib/chain-types";

const mockHasReviveApi = hasReviveApi as jest.Mock;

function createMockClient(instantiateResult?: any) {
  return {
    call: {
      reviveApi: {
        instantiate: jest.fn().mockResolvedValue(
          instantiateResult || {
            weightRequired: { refTime: BigInt(1000), proofSize: BigInt(2000) },
            storageDeposit: { type: "Charge", value: BigInt(5000) },
            gasConsumed: BigInt(800),
            result: {
              isOk: true,
              value: {
                result: { flags: { bits: 0 }, data: "0x" },
                addr: "0x1234567890abcdef1234567890abcdef12345678",
              },
            },
          }
        ),
      },
    },
  } as any;
}

describe("useGasEstimation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when client is null", async () => {
    const { result } = renderHook(() =>
      useGasEstimation(null, "0xorigin", BigInt(0), "0x1234", "0x")
    );

    await act(async () => {
      await result.current.estimate();
    });

    expect(result.current.error).toBe("No client connected");
    expect(result.current.weightRequired).toBeNull();
  });

  it("returns error when client has no reviveApi", async () => {
    const client = {} as any;
    mockHasReviveApi.mockReturnValue(false);

    const { result } = renderHook(() =>
      useGasEstimation(client, "0xorigin", BigInt(0), "0x1234", "0x")
    );

    await act(async () => {
      await result.current.estimate();
    });

    expect(result.current.error).toContain("does not support Revive API");
  });

  it("returns error when no origin (account)", async () => {
    const client = createMockClient();
    mockHasReviveApi.mockReturnValue(true);

    const { result } = renderHook(() =>
      useGasEstimation(client, "", BigInt(0), "0x1234", "0x")
    );

    await act(async () => {
      await result.current.estimate();
    });

    expect(result.current.error).toContain("No account connected");
  });

  it("returns error when no bytecode", async () => {
    const client = createMockClient();
    mockHasReviveApi.mockReturnValue(true);

    const { result } = renderHook(() =>
      useGasEstimation(client, "0xorigin", BigInt(0), "", "0x")
    );

    await act(async () => {
      await result.current.estimate();
    });

    expect(result.current.error).toContain("No bytecode");
  });

  it("applies 10% buffer on successful estimation", async () => {
    const client = createMockClient();
    mockHasReviveApi.mockReturnValue(true);

    const { result } = renderHook(() =>
      useGasEstimation(client, "0xorigin", BigInt(0), "0x1234", "0x")
    );

    await act(async () => {
      await result.current.estimate();
    });

    expect(result.current.error).toBeNull();
    // 1000 + 10% = 1100
    expect(result.current.weightRequired?.refTime).toBe(BigInt(1100));
    // 2000 + 10% = 2200
    expect(result.current.weightRequired?.proofSize).toBe(BigInt(2200));
    // Storage Charge: 5000 + 10% = 5500
    expect(result.current.storageDeposit?.type).toBe("Charge");
    expect(result.current.storageDeposit?.value).toBe(BigInt(5500));
    expect(result.current.gasConsumed).toBe(BigInt(800));
    expect(result.current.deployedAddress).toBe(
      "0x1234567890abcdef1234567890abcdef12345678"
    );
  });

  it("does not buffer Refund storage deposit", async () => {
    const client = createMockClient({
      weightRequired: { refTime: BigInt(100), proofSize: BigInt(200) },
      storageDeposit: { type: "Refund", value: BigInt(3000) },
      gasConsumed: BigInt(50),
      result: {
        isOk: true,
        value: {
          result: { flags: { bits: 0 }, data: "0x" },
          addr: "0xaddr",
        },
      },
    });
    mockHasReviveApi.mockReturnValue(true);

    const { result } = renderHook(() =>
      useGasEstimation(client, "0xorigin", BigInt(0), "0x1234", "0x")
    );

    await act(async () => {
      await result.current.estimate();
    });

    expect(result.current.storageDeposit?.type).toBe("Refund");
    // Refund value is NOT buffered
    expect(result.current.storageDeposit?.value).toBe(BigInt(3000));
  });

  it("handles dry-run dispatch error", async () => {
    const client = createMockClient({
      weightRequired: { refTime: BigInt(100), proofSize: BigInt(200) },
      storageDeposit: { type: "Charge", value: BigInt(1000) },
      gasConsumed: BigInt(50),
      result: {
        isOk: false,
        err: { type: "Module", value: { index: 8, error: "0x01000000" } },
      },
    });
    mockHasReviveApi.mockReturnValue(true);

    const { result } = renderHook(() =>
      useGasEstimation(client, "0xorigin", BigInt(0), "0x1234", "0x")
    );

    await act(async () => {
      await result.current.estimate();
    });

    expect(result.current.error).toContain("Dry-run failed");
    // Failed dry-run must NOT populate estimate state — consumers check
    // weightRequired to enable deploy buttons and auto-fill form fields
    expect(result.current.weightRequired).toBeNull();
    expect(result.current.storageDeposit).toBeNull();
    expect(result.current.gasConsumed).toBeNull();
    expect(result.current.deployedAddress).toBeNull();
  });

  it("handles RPC exception", async () => {
    const client = {
      call: {
        reviveApi: {
          instantiate: jest.fn().mockRejectedValue(new Error("RPC timeout")),
        },
      },
    } as any;
    mockHasReviveApi.mockReturnValue(true);

    const { result } = renderHook(() =>
      useGasEstimation(client, "0xorigin", BigInt(0), "0x1234", "0x")
    );

    await act(async () => {
      await result.current.estimate();
    });

    expect(result.current.error).toBe("RPC timeout");
    expect(result.current.estimating).toBe(false);
  });
});
