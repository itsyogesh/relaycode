import type { ParamInputProps } from "@/components/params/types";
import type { PalletContextData } from "@/types/pallet-context";
import { ReferendumSelector } from "@/components/params/selectors/referendum-selector";
import { TrackSelector } from "@/components/params/selectors/track-selector";
import { BountySelector } from "@/components/params/selectors/bounty-selector";
import { ValidatorMultiSelector } from "@/components/params/selectors/validator-multi-selector";
import { PoolSelector } from "@/components/params/selectors/pool-selector";
import { ProxyTypeSelector } from "@/components/params/selectors/proxy-type-selector";
import { AssetSelector } from "@/components/params/selectors/asset-selector";
import { VestingInfoDisplay } from "@/components/params/selectors/vesting-info-display";
import { CoreSelector } from "@/components/params/selectors/core-selector";
import { DestinationChainSelector } from "@/components/params/selectors/destination-chain-selector";
import { MultisigCallSelector } from "@/components/params/selectors/multisig-call-selector";
import { findComponent } from "./input-map";
import type { ParamComponentType } from "@/components/params/types";
import type { DedotClient } from "dedot";

// Override: pallet → method → fieldName → component
const PALLET_OVERRIDES: Record<
  string,
  Record<string, Record<string, React.ComponentType<ParamInputProps>>>
> = {
  ConvictionVoting: {
    vote: {
      poll_index: ReferendumSelector,
    },
    delegate: {
      class: TrackSelector,
    },
    undelegate: {
      class: TrackSelector,
    },
    remove_vote: {
      class: TrackSelector,
      index: ReferendumSelector,
    },
  },
  Referenda: {
    cancel: {
      index: ReferendumSelector,
    },
    kill: {
      index: ReferendumSelector,
    },
    place_decision_deposit: {
      index: ReferendumSelector,
    },
    refund_decision_deposit: {
      index: ReferendumSelector,
    },
  },
  Staking: {
    nominate: {
      targets: ValidatorMultiSelector,
    },
  },
  NominationPools: {
    join: {
      pool_id: PoolSelector,
    },
    bond_extra: {
      pool_id: PoolSelector,
    },
    unbond: {
      pool_id: PoolSelector,
    },
    nominate: {
      pool_id: PoolSelector,
      validators: ValidatorMultiSelector,
    },
  },
  Bounties: {
    approve_bounty: {
      bounty_id: BountySelector,
    },
    propose_curator: {
      bounty_id: BountySelector,
    },
    close_bounty: {
      bounty_id: BountySelector,
    },
    award_bounty: {
      bounty_id: BountySelector,
    },
    claim_bounty: {
      bounty_id: BountySelector,
    },
  },
  Proxy: {
    add_proxy: {
      proxy_type: ProxyTypeSelector,
    },
    remove_proxy: {
      proxy_type: ProxyTypeSelector,
    },
    proxy: {
      force_proxy_type: ProxyTypeSelector,
    },
  },
  Assets: {
    transfer: {
      id: AssetSelector,
    },
    transfer_keep_alive: {
      id: AssetSelector,
    },
    approve_transfer: {
      id: AssetSelector,
    },
    mint: {
      id: AssetSelector,
    },
    burn: {
      id: AssetSelector,
    },
    freeze: {
      id: AssetSelector,
    },
    thaw: {
      id: AssetSelector,
    },
  },
  Vesting: {
    vest: {
      _context_hint: VestingInfoDisplay,
    },
    vest_other: {
      _context_hint: VestingInfoDisplay,
    },
    vested_transfer: {
      _context_hint: VestingInfoDisplay,
    },
  },
  Broker: {
    purchase: {
      _context_hint: CoreSelector,
    },
    assign: {
      core: CoreSelector,
    },
    interlace: {
      core: CoreSelector,
    },
  },
  XcmPallet: {
    limited_teleport_assets: {
      dest: DestinationChainSelector,
    },
    reserve_transfer_assets: {
      dest: DestinationChainSelector,
    },
    transfer_assets: {
      dest: DestinationChainSelector,
    },
  },
  PolkadotXcm: {
    limited_teleport_assets: {
      dest: DestinationChainSelector,
    },
    reserve_transfer_assets: {
      dest: DestinationChainSelector,
    },
    transfer_assets: {
      dest: DestinationChainSelector,
    },
  },
  Multisig: {
    approve_as_multi: {
      call_hash: MultisigCallSelector,
    },
    as_multi: {
      call_hash: MultisigCallSelector,
    },
  },
};

export function findComponentWithContext(
  palletName: string | undefined,
  methodName: string | undefined,
  fieldName: string,
  typeName: string,
  typeId?: number,
  client?: DedotClient<any>,
  palletContext?: PalletContextData | null
): ParamComponentType & { typeId?: number; isOverride?: boolean } {
  // Check overrides first
  if (palletName && methodName && palletContext) {
    const palletOverrides = PALLET_OVERRIDES[palletName];
    if (palletOverrides) {
      const methodOverrides = palletOverrides[methodName];
      if (methodOverrides) {
        const override = methodOverrides[fieldName];
        if (override) {
          return {
            component: override as any,
            schema: null as any, // Context selectors handle their own validation
            typeId,
            isOverride: true,
          };
        }
      }
    }
  }

  // Fall through to generic registry
  return findComponent(typeName, typeId, client);
}
