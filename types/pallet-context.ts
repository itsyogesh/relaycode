export interface ReferendumInfo {
  index: number;
  title?: string;
  status: string;
  trackId: number;
  trackName?: string;
  proposer?: string;
  proposerIdentity?: string;
  tally?: {
    ayes: string;
    nays: string;
    support: string;
  };
  createdAt?: string;
}

export interface TrackInfo {
  id: number;
  name: string;
  maxDeciding?: number;
  currentDeciding?: number;
}

export interface BountyInfo {
  index: number;
  title?: string;
  description?: string;
  value?: string;
  curator?: string;
  curatorIdentity?: string;
  status: string;
}

export interface ValidatorInfo {
  address: string;
  identity?: string;
  isVerified?: boolean;
  commission: number; // percentage
  totalStake?: string;
  nominatorCount?: number;
  isActive: boolean;
  isOversubscribed?: boolean;
}

export interface PoolInfo {
  id: number;
  name: string;
  state: string;
  memberCount: number;
  totalStake?: string;
  depositor?: string;
  depositorIdentity?: string;
}

export interface ChainTokenMeta {
  tokenSymbol: string;
  tokenDecimals: number;
}

export interface GovernanceContext extends ChainTokenMeta {
  type: "governance";
  referenda: ReferendumInfo[];
  tracks: TrackInfo[];
  bounties: BountyInfo[];
}

export interface StakingContext extends ChainTokenMeta {
  type: "staking";
  validators: ValidatorInfo[];
  pools: PoolInfo[];
  currentEra?: number;
  activeEra?: number;
}

export type PalletContextData = GovernanceContext | StakingContext;

export type ContextGroup = "governance" | "staking";

export const PALLET_CONTEXT_GROUP: Record<string, ContextGroup> = {
  ConvictionVoting: "governance",
  Referenda: "governance",
  Bounties: "governance",
  Treasury: "governance",
  Staking: "staking",
  NominationPools: "staking",
};

// Known genesis hashes → network names for API calls
const GENESIS_TO_NETWORK: Record<string, string> = {
  "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3": "polkadot",
  "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe": "kusama",
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e": "westend",
  "0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f": "paseo",
};

export function networkFromGenesisHash(hash: string): string {
  return GENESIS_TO_NETWORK[hash.toLowerCase()] ?? "polkadot";
}
