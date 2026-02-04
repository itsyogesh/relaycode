import { DedotClient } from "dedot";
import { encodeArg } from "./codec";

/**
 * Result of validating a single field
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Result of validating all fields
 */
export interface ValidationAllResult {
  valid: boolean;
  results: Map<string, ValidationResult>;
  errors: string[];
}

/**
 * Validate a single field value by attempting to encode it
 */
export function validateField(
  client: DedotClient<any>,
  typeId: number,
  value: unknown,
  fieldName: string
): ValidationResult {
  // Check for empty/undefined values
  if (value === undefined || value === null || value === "") {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  // Try to encode the value to validate it
  const result = encodeArg(client, typeId, value);
  if (!result.success) {
    return {
      valid: false,
      error: result.error,
    };
  }

  // Check if encoding produced actual bytes (not just "0x")
  if (result.hex === "0x") {
    return {
      valid: false,
      error: `${fieldName} could not be encoded`,
    };
  }

  return { valid: true };
}

/**
 * Validate all form arguments against their metadata types
 */
export function validateAllArgs(
  client: DedotClient<any>,
  fields: readonly { name?: string; typeId: number }[],
  values: Record<string, unknown>
): ValidationAllResult {
  const results = new Map<string, ValidationResult>();
  const errors: string[] = [];
  let allValid = true;

  for (const field of fields) {
    const fieldName = field.name || "";
    const value = values[fieldName];
    const result = validateField(client, field.typeId, value, fieldName);

    results.set(fieldName, result);

    if (!result.valid) {
      allValid = false;
      if (result.error) {
        errors.push(result.error);
      }
    }
  }

  return {
    valid: allValid,
    results,
    errors,
  };
}

/**
 * Validate vector constraints
 */
export function validateVectorConstraints(
  items: unknown[],
  minItems?: number,
  maxItems?: number,
  fieldName?: string
): ValidationResult {
  const name = fieldName || "Vector";

  if (minItems !== undefined && items.length < minItems) {
    return {
      valid: false,
      error: `${name} must have at least ${minItems} item${minItems === 1 ? "" : "s"}`,
    };
  }

  if (maxItems !== undefined && items.length > maxItems) {
    return {
      valid: false,
      error: `${name} must have at most ${maxItems} item${maxItems === 1 ? "" : "s"}`,
    };
  }

  // Check for undefined items
  const undefinedCount = items.filter((item) => item === undefined || item === null).length;
  if (undefinedCount > 0) {
    return {
      valid: false,
      error: `${name} has ${undefinedCount} empty item${undefinedCount === 1 ? "" : "s"}`,
    };
  }

  return { valid: true };
}

/**
 * Validate struct fields
 */
export function validateStructFields(
  values: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult {
  const missingFields: string[] = [];

  for (const fieldName of requiredFields) {
    const value = values[fieldName];
    if (value === undefined || value === null || value === "") {
      missingFields.push(fieldName);
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
 * Check if a value looks like a valid SS58 address
 */
export function isValidAddressFormat(value: string): boolean {
  // Basic format check for SS58 addresses
  // They are typically 47-48 characters and start with a digit or letter
  if (!value || typeof value !== "string") return false;
  if (value.length < 40 || value.length > 52) return false;
  // Check for valid base58 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(value);
}

/**
 * Check if a value looks like a valid hex string
 */
export function isValidHexFormat(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return /^0x[0-9a-fA-F]*$/.test(value);
}

/**
 * Validate a balance/amount value
 */
export function validateAmount(
  value: unknown,
  fieldName?: string
): ValidationResult {
  const name = fieldName || "Amount";

  if (value === undefined || value === null || value === "") {
    return {
      valid: false,
      error: `${name} is required`,
    };
  }

  const strValue = String(value);

  // Check if it's a valid number
  if (!/^\d+(\.\d+)?$/.test(strValue)) {
    return {
      valid: false,
      error: `${name} must be a valid number`,
    };
  }

  // Check for negative values
  const numValue = parseFloat(strValue);
  if (numValue < 0) {
    return {
      valid: false,
      error: `${name} cannot be negative`,
    };
  }

  return { valid: true };
}
