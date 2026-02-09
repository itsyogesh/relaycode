import type { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import type { XcmContext, ParachainInfo, ChainTokenMeta } from "@/types/pallet-context";

// Well-known Polkadot ecosystem parachains
const POLKADOT_PARACHAINS: ParachainInfo[] = [
  { paraId: 1000, name: "Asset Hub (Polkadot)" },
  { paraId: 1001, name: "Collectives" },
  { paraId: 1002, name: "Bridge Hub (Polkadot)" },
  { paraId: 1004, name: "People (Polkadot)" },
  { paraId: 1005, name: "Coretime (Polkadot)" },
  { paraId: 2000, name: "Acala" },
  { paraId: 2002, name: "Clover" },
  { paraId: 2004, name: "Moonbeam" },
  { paraId: 2006, name: "Astar" },
  { paraId: 2011, name: "Equilibrium" },
  { paraId: 2012, name: "Parallel" },
  { paraId: 2019, name: "Composable" },
  { paraId: 2021, name: "Efinity" },
  { paraId: 2026, name: "Nodle" },
  { paraId: 2030, name: "Bifrost" },
  { paraId: 2031, name: "Centrifuge" },
  { paraId: 2032, name: "Interlay" },
  { paraId: 2034, name: "HydraDX" },
  { paraId: 2035, name: "Phala" },
  { paraId: 2037, name: "Unique" },
  { paraId: 2039, name: "Integritee" },
  { paraId: 2043, name: "Origin Trail" },
  { paraId: 2046, name: "Darwinia" },
  { paraId: 2048, name: "Bitgreen" },
  { paraId: 2051, name: "Ajuna" },
  { paraId: 2056, name: "Polkadex" },
  { paraId: 2090, name: "OAK" },
  { paraId: 2092, name: "Zeitgeist" },
  { paraId: 2094, name: "Pendulum" },
  { paraId: 2101, name: "Subsocial" },
  { paraId: 2104, name: "Manta" },
];

const KUSAMA_PARACHAINS: ParachainInfo[] = [
  { paraId: 1000, name: "Asset Hub (Kusama)" },
  { paraId: 1001, name: "Collectives (Kusama)" },
  { paraId: 1002, name: "Bridge Hub (Kusama)" },
  { paraId: 1004, name: "People (Kusama)" },
  { paraId: 1005, name: "Coretime (Kusama)" },
  { paraId: 2000, name: "Karura" },
  { paraId: 2001, name: "Bifrost (Kusama)" },
  { paraId: 2004, name: "Khala" },
  { paraId: 2007, name: "Shiden" },
  { paraId: 2023, name: "Moonriver" },
  { paraId: 2048, name: "Robonomics" },
  { paraId: 2084, name: "Calamari" },
  { paraId: 2090, name: "Basilisk" },
  { paraId: 2092, name: "Kintsugi" },
  { paraId: 2110, name: "Mangata" },
  { paraId: 2113, name: "Kabocha" },
  { paraId: 2114, name: "Turing" },
];

const NETWORK_PARACHAINS: Record<string, ParachainInfo[]> = {
  polkadot: POLKADOT_PARACHAINS,
  kusama: KUSAMA_PARACHAINS,
};

export async function fetchXcmContext(
  client: DedotClient<PolkadotApi>,
  network: string,
  tokenMeta: ChainTokenMeta
): Promise<XcmContext> {
  // Start with hardcoded registry, optionally validate with HRMP channels
  const registryChains = NETWORK_PARACHAINS[network] ?? POLKADOT_PARACHAINS;
  const activeChannels = await fetchActiveHrmpChannels(client);

  let parachains: ParachainInfo[];
  if (activeChannels.size > 0) {
    // Filter to only parachains with active HRMP channels, but keep system chains
    parachains = registryChains.filter(
      (p) => p.paraId < 2000 || activeChannels.has(p.paraId)
    );
  } else {
    parachains = registryChains;
  }

  return {
    type: "xcm",
    parachains,
    ...tokenMeta,
  };
}

async function fetchActiveHrmpChannels(
  client: DedotClient<PolkadotApi>
): Promise<Set<number>> {
  try {
    const query = client.query as any;
    if (!query.hrmp?.hrmpChannels) return new Set();

    const entries = await query.hrmp.hrmpChannels.entries();
    const paraIds = new Set<number>();

    for (const [key] of entries) {
      const k = key as any;
      // HRMP channel keys are (sender, recipient) pairs
      const sender = Number(k?.sender ?? k?.[0]);
      const recipient = Number(k?.recipient ?? k?.[1]);
      if (!isNaN(sender)) paraIds.add(sender);
      if (!isNaN(recipient)) paraIds.add(recipient);
    }

    return paraIds;
  } catch {
    return new Set();
  }
}
