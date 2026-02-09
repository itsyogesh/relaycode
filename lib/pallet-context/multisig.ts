import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import type { MultisigContext, MultisigInfo, ChainTokenMeta } from "@/types/pallet-context";

export async function fetchMultisigContext(
  client: DedotClient<PolkadotApi>,
  _network: string,
  tokenMeta: ChainTokenMeta
): Promise<MultisigContext> {
  const pendingMultisigs = await fetchPendingMultisigs(client);

  return {
    type: "multisig",
    pendingMultisigs,
    ...tokenMeta,
  };
}

async function fetchPendingMultisigs(
  client: DedotClient<PolkadotApi>
): Promise<MultisigInfo[]> {
  try {
    const query = client.query as any;
    if (!query.multisig?.multisigs) return [];

    const entries = await query.multisig.multisigs.entries();
    const multisigs: MultisigInfo[] = [];

    for (const [key, value] of entries) {
      if (!value) continue;
      const k = key as any;
      const v = value as any;

      // Key is (AccountId, [u8; 32]) — account + call hash
      const callHash = typeof k?.[1] === "string"
        ? k[1]
        : k?.[1]
          ? `0x${Array.from(k[1] as Uint8Array).map((b: number) => b.toString(16).padStart(2, "0")).join("")}`
          : "";

      multisigs.push({
        callHash,
        approvals: Array.isArray(v.approvals) ? v.approvals.map(String) : [],
        threshold: Number(v.threshold ?? 0),
        depositor: String(v.depositor ?? ""),
        when: {
          height: Number(v.when?.height ?? 0),
          index: Number(v.when?.index ?? 0),
        },
      });
    }

    return multisigs;
  } catch {
    return [];
  }
}
