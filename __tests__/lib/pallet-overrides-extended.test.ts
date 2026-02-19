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

// Mock all input components
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
import { VestingInfoDisplay } from "../../components/params/selectors/vesting-info-display";
import { CoreSelector } from "../../components/params/selectors/core-selector";
import { PoolSelector } from "../../components/params/selectors/pool-selector";
import { ValidatorMultiSelector } from "../../components/params/selectors/validator-selector";
import { Amount } from "../../components/params/inputs/amount";
import type {
  StakingContext,
  VestingContext,
  CoretimeContext,
} from "../../types/pallet-context";

const stakingCtx: StakingContext = {
  type: "staking",
  validators: [],
  pools: [],
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

describe("findComponentWithContext - extended edge cases", () => {
  describe("_context_hint fields", () => {
    it("Vesting.vest._context_hint resolves to VestingInfoDisplay", () => {
      const result = findComponentWithContext(
        "Vesting",
        "vest",
        "_context_hint",
        "u128",
        undefined,
        undefined,
        vestingCtx
      );
      expect(result.component).toBe(VestingInfoDisplay);
      expect(result.isOverride).toBe(true);
    });

    it("Broker.purchase._context_hint resolves to CoreSelector", () => {
      const result = findComponentWithContext(
        "Broker",
        "purchase",
        "_context_hint",
        "u128",
        undefined,
        undefined,
        coretimeCtx
      );
      expect(result.component).toBe(CoreSelector);
      expect(result.isOverride).toBe(true);
    });
  });

  describe("multiple overrides for same pallet method", () => {
    it("NominationPools.nominate has both pool_id and validators overrides", () => {
      const poolResult = findComponentWithContext(
        "NominationPools",
        "nominate",
        "pool_id",
        "u32",
        undefined,
        undefined,
        stakingCtx
      );
      expect(poolResult.component).toBe(PoolSelector);
      expect(poolResult.isOverride).toBe(true);

      const validatorResult = findComponentWithContext(
        "NominationPools",
        "nominate",
        "validators",
        "Vec<AccountId>",
        undefined,
        undefined,
        stakingCtx
      );
      expect(validatorResult.component).toBe(ValidatorMultiSelector);
      expect(validatorResult.isOverride).toBe(true);
    });
  });

  describe("override with typeId", () => {
    it("passes typeId through to the result", () => {
      const result = findComponentWithContext(
        "NominationPools",
        "join",
        "pool_id",
        "u32",
        42,
        undefined,
        stakingCtx
      );
      expect(result.component).toBe(PoolSelector);
      expect(result.isOverride).toBe(true);
      expect(result.typeId).toBe(42);
    });
  });

  describe("override that does not match falls through to default", () => {
    it("NominationPools.join with non-matching field falls through to findComponent", () => {
      const result = findComponentWithContext(
        "NominationPools",
        "join",
        "amount",
        "u128",
        undefined,
        undefined,
        stakingCtx
      );
      // "amount" is not in the override map for NominationPools.join
      // so it falls through to findComponent which resolves "u128" to Amount
      expect(result.component).toBe(Amount);
      expect(result.isOverride).toBeUndefined();
    });
  });
});
