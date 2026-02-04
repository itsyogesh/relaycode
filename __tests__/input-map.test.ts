// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../env.mjs", () => ({
  env: {},
}));

import { findComponent } from "../lib/input-map";
import { Account } from "../components/params/inputs/account";
import { Balance } from "../components/params/inputs/balance";
import { Amount } from "../components/params/inputs/amount";
import { Boolean } from "../components/params/inputs/boolean";
import { Hash256 } from "../components/params/inputs/hash";
import { Bytes } from "../components/params/inputs/bytes";
import { Option } from "../components/params/inputs/option";
import { Vector } from "../components/params/inputs/vector";
import { Text } from "../components/params/inputs/text";

describe("findComponent", () => {
  it("should return Account for AccountId types", () => {
    expect(findComponent("AccountId").component).toBe(Account);
    expect(findComponent("AccountId32").component).toBe(Account);
    expect(findComponent("MultiAddress").component).toBe(Account);
  });

  it("should return Balance for Balance types", () => {
    expect(findComponent("Balance").component).toBe(Balance);
    expect(findComponent("BalanceOf").component).toBe(Balance);
  });

  it("should return Amount for numeric types", () => {
    expect(findComponent("u128").component).toBe(Amount);
    expect(findComponent("u32").component).toBe(Amount);
    expect(findComponent("Compact<u128>").component).toBe(Amount);
  });

  it("should return Boolean for bool", () => {
    expect(findComponent("bool").component).toBe(Boolean);
  });

  it("should return Hash256 for hash types", () => {
    expect(findComponent("H256").component).toBe(Hash256);
    expect(findComponent("Hash").component).toBe(Hash256);
  });

  it("should return Bytes for byte types", () => {
    expect(findComponent("Bytes").component).toBe(Bytes);
    expect(findComponent("Vec<u8>").component).toBe(Bytes);
  });

  it("should return Option for Option types", () => {
    expect(findComponent("Option<u32>").component).toBe(Option);
  });

  it("should return Vector for Vec types", () => {
    expect(findComponent("Vec<AccountId>").component).toBe(Vector);
    expect(findComponent("BoundedVec<u8>").component).toBe(Vector);
  });

  it("should default to Text for unknown types", () => {
    expect(findComponent("unknownType").component).toBe(Text);
  });
});
