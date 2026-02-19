// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

// Mock selector components
jest.mock("../../components/params/selectors/referendum-selector", () => ({
  ReferendumSelector: { displayName: "ReferendumSelector" },
}));

jest.mock("../../components/params/selectors/track-selector", () => ({
  TrackSelector: { displayName: "TrackSelector" },
}));

jest.mock("../../components/params/selectors/bounty-selector", () => ({
  BountySelector: { displayName: "BountySelector" },
}));

jest.mock("../../components/params/selectors/validator-selector", () => ({
  ValidatorSelector: { displayName: "ValidatorSelector" },
  ValidatorMultiSelector: { displayName: "ValidatorMultiSelector" },
}));

jest.mock("../../components/params/selectors/pool-selector", () => ({
  PoolSelector: { displayName: "PoolSelector" },
}));

jest.mock("../../components/params/selectors/proxy-type-selector", () => ({
  ProxyTypeSelector: { displayName: "ProxyTypeSelector" },
}));

jest.mock("../../components/params/selectors/asset-selector", () => ({
  AssetSelector: { displayName: "AssetSelector" },
}));

jest.mock("../../components/params/selectors/vesting-info-display", () => ({
  VestingInfoDisplay: { displayName: "VestingInfoDisplay" },
}));

jest.mock("../../components/params/selectors/core-selector", () => ({
  CoreSelector: { displayName: "CoreSelector" },
}));

jest.mock("../../components/params/selectors/destination-chain-selector", () => ({
  DestinationChainSelector: { displayName: "DestinationChainSelector" },
}));

jest.mock("../../components/params/selectors/multisig-call-selector", () => ({
  MultisigCallSelector: { displayName: "MultisigCallSelector" },
}));

// Mock all input components (same pattern as input-map.test.ts)
jest.mock("../../components/params/inputs/account", () => ({
  Account: { displayName: "Account", schema: {} },
}));
jest.mock("../../components/params/inputs/balance", () => ({
  Balance: { displayName: "Balance", schema: {} },
}));
jest.mock("../../components/params/inputs/amount", () => ({
  Amount: { displayName: "Amount", schema: {} },
}));
jest.mock("../../components/params/inputs/boolean", () => ({
  Boolean: { displayName: "Boolean", schema: {} },
}));
jest.mock("../../components/params/inputs/hash", () => ({
  Hash160: { displayName: "Hash160", schema: {} },
  Hash256: { displayName: "Hash256", schema: {} },
  Hash512: { displayName: "Hash512", schema: {} },
}));
jest.mock("../../components/params/inputs/bytes", () => ({
  Bytes: { displayName: "Bytes", schema: {} },
}));
jest.mock("../../components/params/inputs/option", () => ({
  Option: { displayName: "Option", schema: {} },
}));
jest.mock("../../components/params/inputs/vector", () => ({
  Vector: { displayName: "Vector", schema: {} },
  BTreeSet: { displayName: "BTreeSet", schema: {} },
}));
jest.mock("../../components/params/inputs/vector-fixed", () => ({
  VectorFixed: { displayName: "VectorFixed", schema: {} },
}));
jest.mock("../../components/params/inputs/btree-map", () => ({
  BTreeMap: { displayName: "BTreeMap", schema: {} },
}));
jest.mock("../../components/params/inputs/call", () => ({
  Call: { displayName: "Call", schema: {} },
}));
jest.mock("../../components/params/inputs/enum", () => ({
  Enum: { displayName: "Enum", schema: {} },
}));
jest.mock("../../components/params/inputs/struct", () => ({
  Struct: { displayName: "Struct", schema: {} },
}));
jest.mock("../../components/params/inputs/text", () => ({
  Text: { displayName: "Text", schema: {} },
}));
jest.mock("../../components/params/inputs/moment", () => ({
  Moment: { displayName: "Moment", schema: {} },
}));
jest.mock("../../components/params/inputs/vote", () => ({
  Vote: { displayName: "Vote", schema: {} },
}));
jest.mock("../../components/params/inputs/vote-threshold", () => ({
  VoteThreshold: { displayName: "VoteThreshold", schema: {} },
}));
jest.mock("../../components/params/inputs/key-value", () => ({
  KeyValue: { displayName: "KeyValue", schema: {} },
}));
jest.mock("../../components/params/inputs/tuple", () => ({
  Tuple: { displayName: "Tuple", schema: {} },
}));

import { findComponentWithContext } from "../../lib/pallet-overrides";
import { ReferendumSelector } from "../../components/params/selectors/referendum-selector";
import { TrackSelector } from "../../components/params/selectors/track-selector";
import { BountySelector } from "../../components/params/selectors/bounty-selector";
import { ValidatorMultiSelector } from "../../components/params/selectors/validator-selector";
import { PoolSelector } from "../../components/params/selectors/pool-selector";
import { ProxyTypeSelector } from "../../components/params/selectors/proxy-type-selector";
import { AssetSelector } from "../../components/params/selectors/asset-selector";
import { VestingInfoDisplay } from "../../components/params/selectors/vesting-info-display";
import { CoreSelector } from "../../components/params/selectors/core-selector";
import { DestinationChainSelector } from "../../components/params/selectors/destination-chain-selector";
import { MultisigCallSelector } from "../../components/params/selectors/multisig-call-selector";
import { Amount } from "../../components/params/inputs/amount";
import type {
  GovernanceContext,
  StakingContext,
  ProxyContext,
  AssetsContext,
  VestingContext,
  CoretimeContext,
  XcmContext,
  MultisigContext,
} from "../../types/pallet-context";

const governanceCtx: GovernanceContext = {
  type: "governance",
  referenda: [],
  tracks: [],
  bounties: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const stakingCtx: StakingContext = {
  type: "staking",
  validators: [],
  pools: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const proxyCtx: ProxyContext = {
  type: "proxy",
  proxyTypes: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const assetsCtx: AssetsContext = {
  type: "assets",
  assets: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const vestingCtx: VestingContext = {
  type: "vesting",
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const coretimeCtx: CoretimeContext = {
  type: "coretime",
  cores: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const xcmCtx: XcmContext = {
  type: "xcm",
  parachains: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const multisigCtx: MultisigContext = {
  type: "multisig",
  pendingMultisigs: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

describe("findComponentWithContext", () => {
  describe("override resolution — returns override when match found", () => {
    it("ConvictionVoting.vote.poll_index → ReferendumSelector", () => {
      const result = findComponentWithContext(
        "ConvictionVoting", "vote", "poll_index", "u32",
        undefined, undefined, governanceCtx
      );
      expect(result.component).toBe(ReferendumSelector);
      expect(result.isOverride).toBe(true);
    });

    it("ConvictionVoting.delegate.class → TrackSelector", () => {
      const result = findComponentWithContext(
        "ConvictionVoting", "delegate", "class", "u16",
        undefined, undefined, governanceCtx
      );
      expect(result.component).toBe(TrackSelector);
      expect(result.isOverride).toBe(true);
    });

    it("Staking.nominate.targets → ValidatorMultiSelector", () => {
      const result = findComponentWithContext(
        "Staking", "nominate", "targets", "Vec<AccountId>",
        undefined, undefined, stakingCtx
      );
      expect(result.component).toBe(ValidatorMultiSelector);
      expect(result.isOverride).toBe(true);
    });

    it("NominationPools.join.pool_id → PoolSelector", () => {
      const result = findComponentWithContext(
        "NominationPools", "join", "pool_id", "u32",
        undefined, undefined, stakingCtx
      );
      expect(result.component).toBe(PoolSelector);
      expect(result.isOverride).toBe(true);
    });

    it("Bounties.approve_bounty.bounty_id → BountySelector", () => {
      const result = findComponentWithContext(
        "Bounties", "approve_bounty", "bounty_id", "u32",
        undefined, undefined, governanceCtx
      );
      expect(result.component).toBe(BountySelector);
      expect(result.isOverride).toBe(true);
    });

    it("Referenda.cancel.index → ReferendumSelector", () => {
      const result = findComponentWithContext(
        "Referenda", "cancel", "index", "u32",
        undefined, undefined, governanceCtx
      );
      expect(result.component).toBe(ReferendumSelector);
      expect(result.isOverride).toBe(true);
    });
  });

  describe("new pallet overrides — Proxy", () => {
    it("Proxy.add_proxy.proxy_type → ProxyTypeSelector", () => {
      const result = findComponentWithContext(
        "Proxy", "add_proxy", "proxy_type", "ProxyType",
        undefined, undefined, proxyCtx
      );
      expect(result.component).toBe(ProxyTypeSelector);
      expect(result.isOverride).toBe(true);
    });

    it("Proxy.remove_proxy.proxy_type → ProxyTypeSelector", () => {
      const result = findComponentWithContext(
        "Proxy", "remove_proxy", "proxy_type", "ProxyType",
        undefined, undefined, proxyCtx
      );
      expect(result.component).toBe(ProxyTypeSelector);
      expect(result.isOverride).toBe(true);
    });

    it("Proxy.proxy.force_proxy_type → ProxyTypeSelector", () => {
      const result = findComponentWithContext(
        "Proxy", "proxy", "force_proxy_type", "Option<ProxyType>",
        undefined, undefined, proxyCtx
      );
      expect(result.component).toBe(ProxyTypeSelector);
      expect(result.isOverride).toBe(true);
    });
  });

  describe("new pallet overrides — Assets", () => {
    it("Assets.transfer.id → AssetSelector", () => {
      const result = findComponentWithContext(
        "Assets", "transfer", "id", "Compact<AssetId>",
        undefined, undefined, assetsCtx
      );
      expect(result.component).toBe(AssetSelector);
      expect(result.isOverride).toBe(true);
    });

    it("Assets.mint.id → AssetSelector", () => {
      const result = findComponentWithContext(
        "Assets", "mint", "id", "Compact<AssetId>",
        undefined, undefined, assetsCtx
      );
      expect(result.component).toBe(AssetSelector);
      expect(result.isOverride).toBe(true);
    });

    it("Assets.freeze.id → AssetSelector", () => {
      const result = findComponentWithContext(
        "Assets", "freeze", "id", "Compact<AssetId>",
        undefined, undefined, assetsCtx
      );
      expect(result.component).toBe(AssetSelector);
      expect(result.isOverride).toBe(true);
    });
  });

  describe("new pallet overrides — Vesting", () => {
    it("Vesting.vest._context_hint → VestingInfoDisplay", () => {
      const result = findComponentWithContext(
        "Vesting", "vest", "_context_hint", "u128",
        undefined, undefined, vestingCtx
      );
      expect(result.component).toBe(VestingInfoDisplay);
      expect(result.isOverride).toBe(true);
    });

    it("Vesting.vested_transfer._context_hint → VestingInfoDisplay", () => {
      const result = findComponentWithContext(
        "Vesting", "vested_transfer", "_context_hint", "VestingInfo",
        undefined, undefined, vestingCtx
      );
      expect(result.component).toBe(VestingInfoDisplay);
      expect(result.isOverride).toBe(true);
    });
  });

  describe("new pallet overrides — Coretime (Broker)", () => {
    it("Broker.assign.core → CoreSelector", () => {
      const result = findComponentWithContext(
        "Broker", "assign", "core", "u16",
        undefined, undefined, coretimeCtx
      );
      expect(result.component).toBe(CoreSelector);
      expect(result.isOverride).toBe(true);
    });

    it("Broker.interlace.core → CoreSelector", () => {
      const result = findComponentWithContext(
        "Broker", "interlace", "core", "u16",
        undefined, undefined, coretimeCtx
      );
      expect(result.component).toBe(CoreSelector);
      expect(result.isOverride).toBe(true);
    });
  });

  describe("new pallet overrides — XCM", () => {
    it("XcmPallet.limited_teleport_assets.dest → DestinationChainSelector", () => {
      const result = findComponentWithContext(
        "XcmPallet", "limited_teleport_assets", "dest", "VersionedMultiLocation",
        undefined, undefined, xcmCtx
      );
      expect(result.component).toBe(DestinationChainSelector);
      expect(result.isOverride).toBe(true);
    });

    it("PolkadotXcm.reserve_transfer_assets.dest → DestinationChainSelector", () => {
      const result = findComponentWithContext(
        "PolkadotXcm", "reserve_transfer_assets", "dest", "VersionedMultiLocation",
        undefined, undefined, xcmCtx
      );
      expect(result.component).toBe(DestinationChainSelector);
      expect(result.isOverride).toBe(true);
    });

    it("XcmPallet.transfer_assets.dest → DestinationChainSelector", () => {
      const result = findComponentWithContext(
        "XcmPallet", "transfer_assets", "dest", "VersionedLocation",
        undefined, undefined, xcmCtx
      );
      expect(result.component).toBe(DestinationChainSelector);
      expect(result.isOverride).toBe(true);
    });
  });

  describe("new pallet overrides — Multisig", () => {
    it("Multisig.approve_as_multi.call_hash → MultisigCallSelector", () => {
      const result = findComponentWithContext(
        "Multisig", "approve_as_multi", "call_hash", "[u8; 32]",
        undefined, undefined, multisigCtx
      );
      expect(result.component).toBe(MultisigCallSelector);
      expect(result.isOverride).toBe(true);
    });

    it("Multisig.as_multi.call_hash → MultisigCallSelector", () => {
      const result = findComponentWithContext(
        "Multisig", "as_multi", "call_hash", "[u8; 32]",
        undefined, undefined, multisigCtx
      );
      expect(result.component).toBe(MultisigCallSelector);
      expect(result.isOverride).toBe(true);
    });
  });

  describe("fallback to findComponent — no override", () => {
    it("falls through when palletContext is null", () => {
      const result = findComponentWithContext(
        "ConvictionVoting", "vote", "poll_index", "u32",
        undefined, undefined, null
      );
      expect(result.isOverride).toBeUndefined();
      expect(result.component).toBe(Amount); // u32 → Amount
    });

    it("falls through when palletContext is undefined", () => {
      const result = findComponentWithContext(
        "ConvictionVoting", "vote", "poll_index", "u32",
        undefined, undefined, undefined
      );
      expect(result.isOverride).toBeUndefined();
    });

    it("falls through when palletName is undefined", () => {
      const result = findComponentWithContext(
        undefined, "vote", "poll_index", "u32",
        undefined, undefined, governanceCtx
      );
      expect(result.isOverride).toBeUndefined();
    });

    it("falls through when methodName is undefined", () => {
      const result = findComponentWithContext(
        "ConvictionVoting", undefined, "poll_index", "u32",
        undefined, undefined, governanceCtx
      );
      expect(result.isOverride).toBeUndefined();
    });

    it("falls through for pallet not in override map (e.g., Balances)", () => {
      const result = findComponentWithContext(
        "Balances", "transfer", "dest", "AccountId",
        undefined, undefined, governanceCtx
      );
      expect(result.isOverride).toBeUndefined();
    });

    it("falls through for method not in override map", () => {
      const result = findComponentWithContext(
        "ConvictionVoting", "unlock", "class", "u16",
        undefined, undefined, governanceCtx
      );
      expect(result.isOverride).toBeUndefined();
    });

    it("falls through for field not in override map", () => {
      const result = findComponentWithContext(
        "ConvictionVoting", "vote", "unknown_field", "u32",
        undefined, undefined, governanceCtx
      );
      expect(result.isOverride).toBeUndefined();
    });
  });
});
