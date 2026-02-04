import {
  getDenominations,
  toPlanck,
  fromPlanck,
  type Denomination,
} from "../../lib/denominations";

describe("getDenominations", () => {
  it("should return denominations for DOT (10 decimals)", () => {
    const denoms = getDenominations("DOT", 10);

    expect(denoms).toHaveLength(3);
    expect(denoms[0]).toEqual({
      label: "DOT",
      multiplier: BigInt("10000000000"),
      maxDecimals: 10,
    });
    expect(denoms[1]).toEqual({
      label: "mDOT",
      multiplier: BigInt("10000000"),
      maxDecimals: 7,
    });
    expect(denoms[2]).toEqual({
      label: "planck",
      multiplier: BigInt(1),
      maxDecimals: 0,
    });
  });

  it("should return denominations for KSM (12 decimals)", () => {
    const denoms = getDenominations("KSM", 12);

    expect(denoms).toHaveLength(3);
    expect(denoms[0]).toEqual({
      label: "KSM",
      multiplier: BigInt("1000000000000"),
      maxDecimals: 12,
    });
    expect(denoms[1]).toEqual({
      label: "mKSM",
      multiplier: BigInt("1000000000"),
      maxDecimals: 9,
    });
    expect(denoms[2]).toEqual({
      label: "planck",
      multiplier: BigInt(1),
      maxDecimals: 0,
    });
  });

  it("should skip milli denomination for chains with < 3 decimals", () => {
    const denoms = getDenominations("UNIT", 2);

    expect(denoms).toHaveLength(2);
    expect(denoms[0].label).toBe("UNIT");
    expect(denoms[1].label).toBe("planck");
  });

  it("should handle zero decimals", () => {
    const denoms = getDenominations("TOKEN", 0);

    expect(denoms).toHaveLength(2);
    expect(denoms[0].multiplier).toBe(BigInt(1));
    expect(denoms[1].multiplier).toBe(BigInt(1));
  });
});

describe("toPlanck", () => {
  const dotDenom: Denomination = {
    label: "DOT",
    multiplier: BigInt("10000000000"),
    maxDecimals: 10,
  };

  const planckDenom: Denomination = {
    label: "planck",
    multiplier: BigInt(1),
    maxDecimals: 0,
  };

  describe("with DOT denomination", () => {
    it("should convert whole numbers", () => {
      expect(toPlanck("1", dotDenom)).toBe("10000000000");
      expect(toPlanck("10", dotDenom)).toBe("100000000000");
      expect(toPlanck("100", dotDenom)).toBe("1000000000000");
    });

    it("should convert decimal values", () => {
      expect(toPlanck("1.5", dotDenom)).toBe("15000000000");
      expect(toPlanck("0.1", dotDenom)).toBe("1000000000");
      expect(toPlanck("0.01", dotDenom)).toBe("100000000");
    });

    it("should handle max precision", () => {
      expect(toPlanck("1.1234567890", dotDenom)).toBe("11234567890");
    });

    it("should return null for excess precision", () => {
      expect(toPlanck("1.12345678901", dotDenom)).toBeNull();
    });

    it("should handle leading zeros in decimal", () => {
      expect(toPlanck("0.0001", dotDenom)).toBe("1000000");
    });
  });

  describe("with planck denomination", () => {
    it("should convert whole numbers directly", () => {
      expect(toPlanck("1000000000", planckDenom)).toBe("1000000000");
      expect(toPlanck("1", planckDenom)).toBe("1");
    });

    it("should handle large numbers", () => {
      expect(toPlanck("123456789012345", planckDenom)).toBe("123456789012345");
    });
  });

  describe("edge cases", () => {
    it("should return null for empty string", () => {
      expect(toPlanck("", dotDenom)).toBeNull();
    });

    it("should return null for whitespace only", () => {
      expect(toPlanck("   ", dotDenom)).toBeNull();
    });

    it("should return null for invalid format", () => {
      expect(toPlanck("abc", dotDenom)).toBeNull();
      expect(toPlanck("1.2.3", dotDenom)).toBeNull();
      expect(toPlanck(".", dotDenom)).toBeNull();
    });

    it("should handle value with only decimal part", () => {
      expect(toPlanck(".5", dotDenom)).toBe("5000000000");
    });

    it("should handle value with trailing decimal", () => {
      expect(toPlanck("1.", dotDenom)).toBe("10000000000");
    });

    it("should trim whitespace", () => {
      expect(toPlanck("  1.5  ", dotDenom)).toBe("15000000000");
    });
  });
});

describe("fromPlanck", () => {
  const dotDenom: Denomination = {
    label: "DOT",
    multiplier: BigInt("10000000000"),
    maxDecimals: 10,
  };

  const planckDenom: Denomination = {
    label: "planck",
    multiplier: BigInt(1),
    maxDecimals: 0,
  };

  describe("with DOT denomination", () => {
    it("should convert whole DOT values", () => {
      expect(fromPlanck("10000000000", dotDenom)).toBe("1");
      expect(fromPlanck("100000000000", dotDenom)).toBe("10");
    });

    it("should convert fractional DOT values", () => {
      expect(fromPlanck("15000000000", dotDenom)).toBe("1.5");
      expect(fromPlanck("1000000000", dotDenom)).toBe("0.1");
    });

    it("should trim trailing zeros", () => {
      expect(fromPlanck("10500000000", dotDenom)).toBe("1.05");
      expect(fromPlanck("10050000000", dotDenom)).toBe("1.005");
    });

    it("should handle very small values", () => {
      expect(fromPlanck("1", dotDenom)).toBe("0.0000000001");
    });
  });

  describe("with planck denomination", () => {
    it("should return value as-is", () => {
      expect(fromPlanck("1000000000", planckDenom)).toBe("1000000000");
      expect(fromPlanck("1", planckDenom)).toBe("1");
    });
  });

  describe("edge cases", () => {
    it("should return 0 for empty string", () => {
      expect(fromPlanck("", dotDenom)).toBe("0");
    });

    it("should return 0 for invalid input", () => {
      expect(fromPlanck("abc", dotDenom)).toBe("0");
    });

    it("should handle zero", () => {
      expect(fromPlanck("0", dotDenom)).toBe("0");
    });
  });
});

describe("round-trip conversion", () => {
  const dotDenom: Denomination = {
    label: "DOT",
    multiplier: BigInt("10000000000"),
    maxDecimals: 10,
  };

  it("should preserve value through toPlanck -> fromPlanck", () => {
    const testValues = ["1", "1.5", "0.1", "10.123", "0.0000000001"];

    testValues.forEach((value) => {
      const planck = toPlanck(value, dotDenom);
      expect(planck).not.toBeNull();
      const result = fromPlanck(planck!, dotDenom);
      expect(result).toBe(value);
    });
  });

  it("should preserve planck value through fromPlanck -> toPlanck", () => {
    const testValues = [
      "10000000000",
      "15000000000",
      "1",
      "123456789",
    ];

    testValues.forEach((planck) => {
      const human = fromPlanck(planck, dotDenom);
      const result = toPlanck(human, dotDenom);
      expect(result).toBe(planck);
    });
  });
});
