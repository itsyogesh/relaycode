import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import type { VestingContext, ChainTokenMeta } from "@/types/pallet-context";

export async function fetchVestingContext(
  client: DedotClient<PolkadotApi>,
  _network: string,
  tokenMeta: ChainTokenMeta
): Promise<VestingContext> {
  const minVestedTransfer = await fetchMinVestedTransfer(client);

  return {
    type: "vesting",
    minVestedTransfer,
    ...tokenMeta,
  };
}

async function fetchMinVestedTransfer(
  client: DedotClient<PolkadotApi>
): Promise<string | undefined> {
  try {
    const consts = client.consts as any;
    if (!consts.vesting) return undefined;
    const min = consts.vesting.minVestedTransfer;
    return min != null ? String(min) : undefined;
  } catch {
    return undefined;
  }
}
