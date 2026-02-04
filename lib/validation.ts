/**
 * Validation utilities for extrinsic builder form inputs
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates vector/array constraints (minItems, maxItems, empty values)
 */
export function validateVectorConstraints(
  items: unknown[],
  minItems?: number,
  maxItems?: number,
  fieldName: string = "Vector"
): ValidationResult {
  // Check for undefined/null items
  const emptyCount = items.filter(
    (item) => item === undefined || item === null
  ).length;

  if (emptyCount > 0) {
    const itemWord = emptyCount === 1 ? "item" : "items";
    return {
      valid: false,
      error: `${fieldName} contains ${emptyCount} empty ${itemWord}`,
    };
  }

  // Check minItems
  if (minItems !== undefined && items.length < minItems) {
    const itemWord = minItems === 1 ? "item" : "items";
    return {
      valid: false,
      error: `${fieldName} requires at least ${minItems} ${itemWord}`,
    };
  }

  // Check maxItems
  if (maxItems !== undefined && items.length > maxItems) {
    return {
      valid: false,
      error: `${fieldName} allows at most ${maxItems} items`,
    };
  }

  return { valid: true };
}

/**
 * Validates that all required struct fields are present and non-empty
 */
export function validateStructFields(
  values: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = values[field];
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validates SS58 address format (basic validation)
 * Uses base58 character set excluding 0, O, I, l
 */
export function isValidAddressFormat(address: unknown): boolean {
  if (typeof address !== "string" || !address) {
    return false;
  }

  // SS58 addresses are 47-48 characters for substrate chains
  if (address.length < 46 || address.length > 50) {
    return false;
  }

  // Base58 character set (no 0, O, I, l)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

/**
 * Validates hex string format
 */
export function isValidHexFormat(value: unknown): boolean {
  if (typeof value !== "string" || !value) {
    return false;
  }

  // Must start with 0x
  if (!value.startsWith("0x")) {
    return false;
  }

  // Only hex characters after 0x
  const hexPart = value.slice(2);
  if (hexPart.length === 0) {
    return true; // 0x is valid empty hex
  }

  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(hexPart);
}

/**
 * Validates numeric amount input
 */
export function validateAmount(
  value: unknown,
  fieldName: string = "Amount"
): ValidationResult {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  // Convert to string for validation
  const strValue = String(value);

  // Check for empty
  if (!strValue || strValue.trim() === "") {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  // Check if it's a valid number
  const numValue = Number(strValue);
  if (isNaN(numValue)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  // Check for negative
  if (numValue < 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be negative`,
    };
  }

  return { valid: true };
}

/**
 * Validates a single field value against its type
 */
export function validateField(
  typeName: string,
  value: unknown,
  fieldName?: string
): ValidationResult {
  const name = fieldName || typeName;

  // Empty check for required fields
  if (value === undefined || value === null || value === "") {
    return {
      valid: false,
      error: `${name} is required`,
    };
  }

  // Type-specific validation
  if (typeName.includes("AccountId") || typeName.includes("Address")) {
    if (!isValidAddressFormat(value)) {
      return {
        valid: false,
        error: `${name} must be a valid SS58 address`,
      };
    }
  }

  if (typeName === "H256" || typeName.includes("Hash")) {
    if (!isValidHexFormat(value) || (typeof value === "string" && value.length !== 66)) {
      return {
        valid: false,
        error: `${name} must be a valid 32-byte hex string`,
      };
    }
  }

  if (typeName.startsWith("u") || typeName.startsWith("i") || typeName.includes("Balance")) {
    return validateAmount(value, name);
  }

  return { valid: true };
}

export interface AllArgsValidationResult {
  valid: boolean;
  results: Map<string, ValidationResult>;
  errors: string[];
}

/**
 * Validates all arguments for an extrinsic call
 */
export function validateAllArgs(
  _client: unknown, // Client parameter for future type-aware validation
  fields: { name?: string; typeName?: string; typeId?: number }[],
  values: Record<string, unknown>
): AllArgsValidationResult {
  const results = new Map<string, ValidationResult>();
  const errors: string[] = [];
  let allValid = true;

  for (const field of fields) {
    const fieldName = field.name || `field_${field.typeId}`;
    const value = values[fieldName];
    const typeName = field.typeName || "unknown";

    const result = validateField(typeName, value, fieldName);
    results.set(fieldName, result);

    if (!result.valid) {
      allValid = false;
      if (result.error) {
        errors.push(result.error);
      }
    }
  }

  return { valid: allValid, results, errors };
}
