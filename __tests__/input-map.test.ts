// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../env.mjs", () => ({
  env: {},
}));

// Mock components with complex dependencies (wallet, QR code libs)
jest.mock("../components/params/inputs/account", () => ({
  Account: { displayName: "Account", schema: {} },
}));

jest.mock("../components/params/inputs/balance", () => ({
  Balance: { displayName: "Balance", schema: {} },
}));

jest.mock("../components/params/inputs/amount", () => ({
  Amount: { displayName: "Amount", schema: {} },
}));

jest.mock("../components/params/inputs/boolean", () => ({
  Boolean: { displayName: "Boolean", schema: {} },
}));

jest.mock("../components/params/inputs/hash", () => ({
  Hash160: { displayName: "Hash160", schema: {} },
  Hash256: { displayName: "Hash256", schema: {} },
  Hash512: { displayName: "Hash512", schema: {} },
}));

jest.mock("../components/params/inputs/bytes", () => ({
  Bytes: { displayName: "Bytes", schema: {} },
}));

jest.mock("../components/params/inputs/option", () => ({
  Option: { displayName: "Option", schema: {} },
}));

jest.mock("../components/params/inputs/vector", () => ({
  Vector: { displayName: "Vector", schema: {} },
}));

jest.mock("../components/params/inputs/vector-fixed", () => ({
  VectorFixed: { displayName: "VectorFixed", schema: {} },
}));

jest.mock("../components/params/inputs/btree-map", () => ({
  BTreeMap: { displayName: "BTreeMap", schema: {} },
}));

jest.mock("../components/params/inputs/btree-set", () => ({
  BTreeSet: { displayName: "BTreeSet", schema: {} },
}));

jest.mock("../components/params/inputs/call", () => ({
  Call: { displayName: "Call", schema: {} },
}));

jest.mock("../components/params/inputs/enum", () => ({
  Enum: { displayName: "Enum", schema: {} },
}));

jest.mock("../components/params/inputs/struct", () => ({
  Struct: { displayName: "Struct", schema: {} },
}));

jest.mock("../components/params/inputs/text", () => ({
  Text: { displayName: "Text", schema: {} },
}));

jest.mock("../components/params/inputs/moment", () => ({
  Moment: { displayName: "Moment", schema: {} },
}));

jest.mock("../components/params/inputs/vote", () => ({
  Vote: { displayName: "Vote", schema: {} },
}));

jest.mock("../components/params/inputs/vote-threshold", () => ({
  VoteThreshold: { displayName: "VoteThreshold", schema: {} },
}));

jest.mock("../components/params/inputs/key-value", () => ({
  KeyValue: { displayName: "KeyValue", schema: {} },
}));

jest.mock("../components/params/inputs/tuple", () => ({
  Tuple: { displayName: "Tuple", schema: {} },
}));

import { findComponent } from "../lib/input-map";
import { Account } from "../components/params/inputs/account";
import { Balance } from "../components/params/inputs/balance";
import { Amount } from "../components/params/inputs/amount";
import { Boolean } from "../components/params/inputs/boolean";
import { Hash160, Hash256, Hash512 } from "../components/params/inputs/hash";
import { Bytes } from "../components/params/inputs/bytes";
import { Option } from "../components/params/inputs/option";
import { Vector } from "../components/params/inputs/vector";
import { VectorFixed } from "../components/params/inputs/vector-fixed";
import { BTreeMap } from "../components/params/inputs/btree-map";
import { BTreeSet } from "../components/params/inputs/btree-set";
import { Call } from "../components/params/inputs/call";
import { Text } from "../components/params/inputs/text";
import { Moment } from "../components/params/inputs/moment";
import { Vote } from "../components/params/inputs/vote";
import { VoteThreshold } from "../components/params/inputs/vote-threshold";

describe("findComponent", () => {
  describe("Account types (Priority 100)", () => {
    it("should return Account for AccountId", () => {
      expect(findComponent("AccountId").component).toBe(Account);
    });

    it("should return Account for AccountId32", () => {
      expect(findComponent("AccountId32").component).toBe(Account);
    });

    it("should return Account for AccountId20", () => {
      expect(findComponent("AccountId20").component).toBe(Account);
    });

    it("should return Account for MultiAddress", () => {
      expect(findComponent("MultiAddress").component).toBe(Account);
    });

    it("should return Account for Address", () => {
      expect(findComponent("Address").component).toBe(Account);
    });

    it("should return Account for LookupSource", () => {
      expect(findComponent("LookupSource").component).toBe(Account);
    });

    it("should match AccountId regex patterns", () => {
      expect(findComponent("AccountIdOf").component).toBe(Account);
      expect(findComponent("MultiAddressLookup").component).toBe(Account);
    });
  });

  describe("Balance types (Priority 95)", () => {
    it("should return Balance for Balance", () => {
      expect(findComponent("Balance").component).toBe(Balance);
    });

    it("should return Balance for BalanceOf", () => {
      expect(findComponent("BalanceOf").component).toBe(Balance);
    });

    it("should match Balance regex patterns", () => {
      expect(findComponent("BalanceOf<T>").component).toBe(Balance);
    });

    it("should return Balance for Compact<Balance>", () => {
      expect(findComponent("Compact<Balance>").component).toBe(Balance);
    });

    it("should return Balance for Compact<BalanceOf>", () => {
      expect(findComponent("Compact<BalanceOf>").component).toBe(Balance);
    });
  });

  describe("Amount/Numeric types (Priority 90)", () => {
    it("should return Amount for u128", () => {
      expect(findComponent("u128").component).toBe(Amount);
    });

    it("should return Amount for u64", () => {
      expect(findComponent("u64").component).toBe(Amount);
    });

    it("should return Amount for u32", () => {
      expect(findComponent("u32").component).toBe(Amount);
    });

    it("should return Amount for u16", () => {
      expect(findComponent("u16").component).toBe(Amount);
    });

    it("should return Amount for u8", () => {
      expect(findComponent("u8").component).toBe(Amount);
    });

    it("should return Amount for signed integers", () => {
      expect(findComponent("i128").component).toBe(Amount);
      expect(findComponent("i64").component).toBe(Amount);
      expect(findComponent("i32").component).toBe(Amount);
    });

    it("should return Amount for Compact types", () => {
      expect(findComponent("Compact<u128>").component).toBe(Amount);
      expect(findComponent("Compact<u64>").component).toBe(Amount);
      expect(findComponent("Compact<u32>").component).toBe(Amount);
    });
  });

  describe("Boolean type (Priority 85)", () => {
    it("should return Boolean for bool", () => {
      expect(findComponent("bool").component).toBe(Boolean);
    });
  });

  describe("Hash types", () => {
    it("should return Hash160 for H160", () => {
      expect(findComponent("H160").component).toBe(Hash160);
    });

    it("should return Hash256 for H256", () => {
      expect(findComponent("H256").component).toBe(Hash256);
    });

    it("should return Hash256 for Hash", () => {
      expect(findComponent("Hash").component).toBe(Hash256);
    });

    it("should return Hash512 for H512", () => {
      expect(findComponent("H512").component).toBe(Hash512);
    });

    it("should match Hash regex patterns", () => {
      expect(findComponent("BlockHash").component).toBe(Hash256);
      expect(findComponent("ExtrinsicHash").component).toBe(Hash256);
    });
  });

  describe("Bytes types (Priority 75)", () => {
    it("should return Bytes for Bytes", () => {
      expect(findComponent("Bytes").component).toBe(Bytes);
    });

    it("should return Bytes for Vec<u8>", () => {
      expect(findComponent("Vec<u8>").component).toBe(Bytes);
    });
  });

  describe("Call types (Priority 70)", () => {
    it("should return Call for Call", () => {
      expect(findComponent("Call").component).toBe(Call);
    });

    it("should return Call for RuntimeCall", () => {
      expect(findComponent("RuntimeCall").component).toBe(Call);
    });

    it("should match Call regex patterns", () => {
      expect(findComponent("Box<RuntimeCall>").component).toBe(Call);
    });
  });

  describe("Moment type (Priority 65)", () => {
    it("should return Moment for Moment", () => {
      expect(findComponent("Moment").component).toBe(Moment);
    });
  });

  describe("Vote type (Priority 60)", () => {
    it("should return Vote for AccountVote", () => {
      expect(findComponent("AccountVote").component).toBe(Vote);
    });
    it("should return Vote for AccountVote<BalanceOf<T, I>>", () => {
      expect(findComponent("AccountVote<BalanceOf<T, I>>").component).toBe(Vote);
    });
  });

  describe("VoteThreshold type (Priority 55)", () => {
    it("should return VoteThreshold for VoteThreshold", () => {
      expect(findComponent("VoteThreshold").component).toBe(VoteThreshold);
    });
  });

  describe("Option types (Priority 45)", () => {
    it("should return Option for Option<T> types", () => {
      expect(findComponent("Option<u32>").component).toBe(Option);
      expect(findComponent("Option<AccountId>").component).toBe(Option);
      expect(findComponent("Option<Balance>").component).toBe(Option);
    });
  });

  describe("VectorFixed types (Priority 43)", () => {
    it("should return VectorFixed for [u8; 32]", () => {
      expect(findComponent("[u8; 32]").component).toBe(VectorFixed);
    });

    it("should return VectorFixed for [u8; 64]", () => {
      expect(findComponent("[u8; 64]").component).toBe(VectorFixed);
    });

    it("should return VectorFixed for [AccountId; 3]", () => {
      expect(findComponent("[AccountId; 3]").component).toBe(VectorFixed);
    });
  });

  describe("BTreeMap types (Priority 42)", () => {
    it("should return BTreeMap for BTreeMap<K, V> types", () => {
      expect(findComponent("BTreeMap<AccountId, Balance>").component).toBe(BTreeMap);
      expect(findComponent("BTreeMap<u32, Vec<u8>>").component).toBe(BTreeMap);
    });
  });

  describe("BTreeSet types (Priority 41)", () => {
    it("should return BTreeSet for BTreeSet<T> types", () => {
      expect(findComponent("BTreeSet<AccountId>").component).toBe(BTreeSet);
      expect(findComponent("BTreeSet<u32>").component).toBe(BTreeSet);
    });
  });

  describe("Vector types (Priority 40)", () => {
    it("should return Vector for Vec<T> types", () => {
      expect(findComponent("Vec<AccountId>").component).toBe(Vector);
      expect(findComponent("Vec<Balance>").component).toBe(Vector);
    });

    it("should return Vector for BoundedVec types", () => {
      expect(findComponent("BoundedVec<u8, MaxLen>").component).toBe(Vector);
    });

    it("should NOT return Vector for Vec<u8> (should be Bytes)", () => {
      // Vec<u8> has higher priority match to Bytes
      expect(findComponent("Vec<u8>").component).toBe(Bytes);
    });
  });

  describe("Struct types (Priority 35) - Fallback for composite", () => {
    // Struct has no patterns, used as fallback for composite types
    // resolved via typeId inspection
  });

  describe("Enum types (Priority 30) - Fallback for enum", () => {
    // Enum has no patterns, used as fallback for enum types
    // resolved via typeId inspection
  });

  describe("Fallback to Text", () => {
    it("should default to Text for unknown types", () => {
      expect(findComponent("UnknownType").component).toBe(Text);
      expect(findComponent("SomeRandomType").component).toBe(Text);
    });
  });

  describe("Priority ordering", () => {
    it("should prefer Bytes over Vector for Vec<u8>", () => {
      // Bytes has priority 75, Vector has 40
      expect(findComponent("Vec<u8>").component).toBe(Bytes);
    });

    it("should prefer Balance over Amount for Balance types", () => {
      // Balance has priority 95, Amount has 90
      expect(findComponent("Balance").component).toBe(Balance);
    });

    it("should prefer Balance over Amount for Compact<Balance>", () => {
      // Balance has priority 95, Amount regex /Compact</ has 90
      expect(findComponent("Compact<Balance>").component).toBe(Balance);
    });

    it("should prefer Account over text for AccountId", () => {
      // Account has priority 100
      expect(findComponent("AccountId").component).toBe(Account);
    });

    it("should prefer VectorFixed over Vector for fixed arrays", () => {
      // VectorFixed has priority 43, Vector has 40
      expect(findComponent("[u8; 32]").component).toBe(VectorFixed);
    });

    it("should prefer BTreeMap over Vector for BTreeMap types", () => {
      // BTreeMap has priority 42, Vector has 40
      expect(findComponent("BTreeMap<u32, u64>").component).toBe(BTreeMap);
    });

    it("should prefer BTreeSet over Vector for BTreeSet types", () => {
      // BTreeSet has priority 41, Vector has 40
      expect(findComponent("BTreeSet<u32>").component).toBe(BTreeSet);
    });

    it("should prefer Hash160 over Hash256 for H160", () => {
      expect(findComponent("H160").component).toBe(Hash160);
    });

    it("should prefer Hash512 over Hash256 for H512", () => {
      expect(findComponent("H512").component).toBe(Hash512);
    });
  });
});
