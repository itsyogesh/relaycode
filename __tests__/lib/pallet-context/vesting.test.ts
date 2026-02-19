jest.mock("../../../env.mjs", () => ({ env: {} }));

import { fetchVestingContext } from "../../../lib/pallet-context/vesting";
import { createMockDedotClient } from "../../helpers/mock-client";

const tokenMeta = { tokenSymbol: "DOT", tokenDecimals: 10 };

describe("fetchVestingContext", () => {
  it("returns minVestedTransfer and tokenMeta", async () => {
    const client = createMockDedotClient({
      consts: {
        vesting: { minVestedTransfer: BigInt(10000000000) },
      },
    });

    const result = await fetchVestingContext(client, "polkadot", tokenMeta);

    expect(result.type).toBe("vesting");
    expect(result.minVestedTransfer).toBe("10000000000");
    expect(result.tokenSymbol).toBe("DOT");
    expect(result.tokenDecimals).toBe(10);
  });

  it("returns the transfer amount as string when available", async () => {
    const client = createMockDedotClient({
      consts: {
        vesting: { minVestedTransfer: 500 },
      },
    });

    const result = await fetchVestingContext(client, "polkadot", tokenMeta);

    expect(result.minVestedTransfer).toBe("500");
  });

  it("returns undefined when no vesting consts exist", async () => {
    const client = createMockDedotClient({ consts: {} });

    const result = await fetchVestingContext(client, "polkadot", tokenMeta);

    expect(result.minVestedTransfer).toBeUndefined();
  });

  it("returns undefined on error", async () => {
    const client = createMockDedotClient({
      consts: {
        get vesting(): any {
          throw new Error("fail");
        },
      },
    });

    const result = await fetchVestingContext(client, "polkadot", tokenMeta);

    expect(result.minVestedTransfer).toBeUndefined();
  });
});
