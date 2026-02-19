import {
  validateVectorConstraints,
  validateStructFields,
  isValidAddressFormat,
  isValidHexFormat,
  validateAmount,
  validateField,
  validateAllArgs,
} from "../../lib/validation";

describe("validateVectorConstraints", () => {
  describe("minItems validation", () => {
    it("should pass when items >= minItems", () => {
      const result = validateVectorConstraints([1, 2, 3], 2, undefined);
      expect(result.valid).toBe(true);
    });

    it("should fail when items < minItems", () => {
      const result = validateVectorConstraints([1], 2, undefined, "Items");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least 2");
    });

    it("should use singular form for minItems = 1", () => {
      const result = validateVectorConstraints([], 1, undefined);
      expect(result.error).toContain("at least 1 item");
      expect(result.error).not.toContain("items");
    });
  });

  describe("maxItems validation", () => {
    it("should pass when items <= maxItems", () => {
      const result = validateVectorConstraints([1, 2, 3], undefined, 5);
      expect(result.valid).toBe(true);
    });

    it("should fail when items > maxItems", () => {
      const result = validateVectorConstraints([1, 2, 3, 4, 5, 6], undefined, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at most 5");
    });
  });

  describe("undefined items detection", () => {
    it("should fail when array contains undefined", () => {
      const result = validateVectorConstraints([1, undefined, 3], undefined, undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("1 empty item");
    });

    it("should fail when array contains null", () => {
      const result = validateVectorConstraints([1, null, 3], undefined, undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("1 empty item");
    });

    it("should count multiple empty items", () => {
      const result = validateVectorConstraints([undefined, null, undefined], undefined, undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("3 empty items");
    });
  });

  describe("combined constraints", () => {
    it("should pass when all constraints met", () => {
      const result = validateVectorConstraints([1, 2, 3], 2, 5);
      expect(result.valid).toBe(true);
    });

    it("should fail minItems first", () => {
      const result = validateVectorConstraints([1], 2, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least");
    });
  });

  describe("field name in error", () => {
    it("should include field name in error message", () => {
      const result = validateVectorConstraints([], 1, undefined, "Addresses");
      expect(result.error).toContain("Addresses");
    });

    it("should use default name when not provided", () => {
      const result = validateVectorConstraints([], 1, undefined);
      expect(result.error).toContain("Vector");
    });
  });
});

describe("validateStructFields", () => {
  it("should pass when all required fields present", () => {
    const values = { name: "Alice", age: 30 };
    const required = ["name", "age"];
    const result = validateStructFields(values, required);
    expect(result.valid).toBe(true);
  });

  it("should fail when required field is missing", () => {
    const values = { name: "Alice" };
    const required = ["name", "age"];
    const result = validateStructFields(values, required);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("age");
  });

  it("should fail when required field is undefined", () => {
    const values = { name: "Alice", age: undefined };
    const required = ["name", "age"];
    const result = validateStructFields(values, required);
    expect(result.valid).toBe(false);
  });

  it("should fail when required field is null", () => {
    const values = { name: "Alice", age: null };
    const required = ["name", "age"];
    const result = validateStructFields(values, required);
    expect(result.valid).toBe(false);
  });

  it("should fail when required field is empty string", () => {
    const values = { name: "Alice", age: "" };
    const required = ["name", "age"];
    const result = validateStructFields(values, required);
    expect(result.valid).toBe(false);
  });

  it("should list all missing fields", () => {
    const values = { other: "value" };
    const required = ["name", "age", "email"];
    const result = validateStructFields(values, required);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("name");
    expect(result.error).toContain("age");
    expect(result.error).toContain("email");
  });

  it("should pass with empty required array", () => {
    const values = { name: "Alice" };
    const result = validateStructFields(values, []);
    expect(result.valid).toBe(true);
  });

  it("should allow 0 as valid value", () => {
    const values = { count: 0 };
    const required = ["count"];
    const result = validateStructFields(values, required);
    expect(result.valid).toBe(true);
  });

  it("should allow false as valid value", () => {
    const values = { enabled: false };
    const required = ["enabled"];
    const result = validateStructFields(values, required);
    expect(result.valid).toBe(true);
  });
});

describe("isValidAddressFormat", () => {
  it("should return true for valid Polkadot address", () => {
    expect(isValidAddressFormat("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(true);
  });

  it("should return true for valid Kusama address", () => {
    expect(isValidAddressFormat("HNZata7iMYWmk5RvZRTiAsSDhV8366zq2YGb3tLH5Upf74F")).toBe(true);
  });

  it("should return false for too short address", () => {
    expect(isValidAddressFormat("5GrwvaEF5zXb26Fz")).toBe(false);
  });

  it("should return false for too long address", () => {
    expect(isValidAddressFormat("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY123456789")).toBe(false);
  });

  it("should return false for invalid characters", () => {
    expect(isValidAddressFormat("0GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(false);
    expect(isValidAddressFormat("OGrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(false);
    expect(isValidAddressFormat("IGrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(false);
    expect(isValidAddressFormat("lGrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidAddressFormat("")).toBe(false);
  });

  it("should return false for non-string input", () => {
    expect(isValidAddressFormat(null as any)).toBe(false);
    expect(isValidAddressFormat(undefined as any)).toBe(false);
  });
});

describe("isValidHexFormat", () => {
  it("should return true for valid hex with 0x prefix", () => {
    expect(isValidHexFormat("0x1234abcd")).toBe(true);
    expect(isValidHexFormat("0xABCDEF")).toBe(true);
    expect(isValidHexFormat("0x")).toBe(true);
  });

  it("should return false without 0x prefix", () => {
    expect(isValidHexFormat("1234abcd")).toBe(false);
  });

  it("should return false for invalid hex characters", () => {
    expect(isValidHexFormat("0x1234ghij")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidHexFormat("")).toBe(false);
  });

  it("should return false for non-string input", () => {
    expect(isValidHexFormat(null as any)).toBe(false);
    expect(isValidHexFormat(undefined as any)).toBe(false);
  });
});

describe("validateAmount", () => {
  it("should pass for valid positive numbers", () => {
    expect(validateAmount("100").valid).toBe(true);
    expect(validateAmount("1.5").valid).toBe(true);
    expect(validateAmount("0.001").valid).toBe(true);
  });

  it("should pass for zero", () => {
    expect(validateAmount("0").valid).toBe(true);
  });

  it("should fail for empty value", () => {
    const result = validateAmount("");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("required");
  });

  it("should fail for undefined/null", () => {
    expect(validateAmount(undefined).valid).toBe(false);
    expect(validateAmount(null).valid).toBe(false);
  });

  it("should fail for non-numeric string", () => {
    const result = validateAmount("abc");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("valid number");
  });

  it("should fail for negative values", () => {
    const result = validateAmount("-5");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("negative");
  });

  it("should include field name in error", () => {
    const result = validateAmount("", "Transfer Amount");
    expect(result.error).toContain("Transfer Amount");
  });

  it("should handle number input by converting to string", () => {
    expect(validateAmount(100 as any).valid).toBe(true);
  });
});

describe("validateField", () => {
  it("returns error for empty value", () => {
    const result = validateField("AccountId", "");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("required");
  });

  it("returns error for undefined value", () => {
    const result = validateField("AccountId", undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("required");
  });

  it("validates AccountId type with valid address", () => {
    const result = validateField("AccountId", "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
    expect(result.valid).toBe(true);
  });

  it("rejects invalid AccountId", () => {
    const result = validateField("AccountId", "invalid-address");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("SS58 address");
  });

  it("validates H256 with correct 66-char hex", () => {
    const hex66 = "0x" + "ab".repeat(32); // 2 + 64 = 66 chars
    const result = validateField("H256", hex66);
    expect(result.valid).toBe(true);
  });

  it("rejects H256 with wrong length", () => {
    const result = validateField("H256", "0xabcdef");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("32-byte hex");
  });

  it("validates numeric types (u128)", () => {
    const result = validateField("u128", "12345");
    expect(result.valid).toBe(true);
  });

  it("rejects non-numeric value for numeric type", () => {
    const result = validateField("u128", "not-a-number");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("valid number");
  });

  it("passes non-special types with any value", () => {
    const result = validateField("SomeCustomType", "any-value");
    expect(result.valid).toBe(true);
  });
});

describe("validateAllArgs", () => {
  it("validates all fields and returns aggregated valid result", () => {
    const fields = [
      { name: "amount", typeName: "u128" },
      { name: "enabled", typeName: "bool" },
    ];
    const values = { amount: "100", enabled: true };
    const result = validateAllArgs(null, fields, values);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("collects errors from invalid fields", () => {
    const fields = [
      { name: "dest", typeName: "AccountId" },
      { name: "amount", typeName: "u128" },
    ];
    const values = { dest: "bad-address", amount: "not-a-number" };
    const result = validateAllArgs(null, fields, values);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]).toContain("SS58 address");
    expect(result.errors[1]).toContain("valid number");
  });

  it("handles missing values as errors", () => {
    const fields = [{ name: "dest", typeName: "AccountId" }];
    const values = {};
    const result = validateAllArgs(null, fields, values);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("required");
  });

  it("uses typeId fallback for field name", () => {
    const fields = [{ typeName: "u128", typeId: 42 }];
    const values = { field_42: "100" };
    const result = validateAllArgs(null, fields, values);
    expect(result.valid).toBe(true);
    expect(result.results.has("field_42")).toBe(true);
  });
});
