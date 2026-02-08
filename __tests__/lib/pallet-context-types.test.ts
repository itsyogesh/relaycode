import {
  networkFromGenesisHash,
  PALLET_CONTEXT_GROUP,
} from "../../types/pallet-context";

describe("networkFromGenesisHash", () => {
  it("returns 'polkadot' for Polkadot genesis hash", () => {
    expect(
      networkFromGenesisHash(
        "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3"
      )
    ).toBe("polkadot");
  });

  it("returns 'kusama' for Kusama genesis hash", () => {
    expect(
      networkFromGenesisHash(
        "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe"
      )
    ).toBe("kusama");
  });

  it("returns 'westend' for Westend genesis hash", () => {
    expect(
      networkFromGenesisHash(
        "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"
      )
    ).toBe("westend");
  });

  it("returns 'paseo' for Paseo genesis hash", () => {
    expect(
      networkFromGenesisHash(
        "0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f"
      )
    ).toBe("paseo");
  });

  it("returns 'polkadot' as default for unknown hash", () => {
    expect(networkFromGenesisHash("0xdeadbeef")).toBe("polkadot");
  });

  it("handles case-insensitive hashes (uppercase hex)", () => {
    expect(
      networkFromGenesisHash(
        "0x91B171BB158E2D3848FA23A9F1C25182FB8E20313B2C1EB49219DA7A70CE90C3"
      )
    ).toBe("polkadot");
  });

  it("handles mixed-case hashes", () => {
    expect(
      networkFromGenesisHash(
        "0xB0A8D493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe"
      )
    ).toBe("kusama");
  });
});

describe("PALLET_CONTEXT_GROUP", () => {
  it("maps ConvictionVoting to governance", () => {
    expect(PALLET_CONTEXT_GROUP["ConvictionVoting"]).toBe("governance");
  });

  it("maps Referenda to governance", () => {
    expect(PALLET_CONTEXT_GROUP["Referenda"]).toBe("governance");
  });

  it("maps Bounties to governance", () => {
    expect(PALLET_CONTEXT_GROUP["Bounties"]).toBe("governance");
  });

  it("maps Treasury to governance", () => {
    expect(PALLET_CONTEXT_GROUP["Treasury"]).toBe("governance");
  });

  it("maps Staking to staking", () => {
    expect(PALLET_CONTEXT_GROUP["Staking"]).toBe("staking");
  });

  it("maps NominationPools to staking", () => {
    expect(PALLET_CONTEXT_GROUP["NominationPools"]).toBe("staking");
  });

  it("returns undefined for Balances (not mapped)", () => {
    expect(PALLET_CONTEXT_GROUP["Balances"]).toBeUndefined();
  });

  it("returns undefined for System (not mapped)", () => {
    expect(PALLET_CONTEXT_GROUP["System"]).toBeUndefined();
  });
});
