/**
 * Lightweight ABI encoder for Solidity constructor arguments.
 *
 * Strict support matrix — only these types are encoded:
 *   uint8–uint256, int8–int256, address, bool, string, bytes, bytes1–bytes32
 *
 * ALL arrays, ALL tuples, and nested types are UNSUPPORTED and will throw.
 * The UI must check isSupportedType() before calling the encoder.
 */

const WORD = 32; // 32 bytes per ABI word

function padLeft(hex: string, bytes: number): string {
  return hex.padStart(bytes * 2, "0");
}

function padRight(hex: string, bytes: number): string {
  return hex.padEnd(bytes * 2, "0");
}

function uint256Hex(value: bigint): string {
  if (value < BigInt(0)) {
    // Two's complement for negative values
    return ((BigInt(1) << BigInt(256)) + value).toString(16).padStart(64, "0");
  }
  return value.toString(16).padStart(64, "0");
}

function isDynamic(type: string): boolean {
  return type === "string" || type === "bytes";
}

function encodeSingle(type: string, value: any): string {
  // address
  if (type === "address") {
    const cleaned = String(value).toLowerCase().replace("0x", "");
    return padLeft(cleaned, WORD);
  }

  // bool
  if (type === "bool") {
    const b =
      value === true || value === "true" || value === "1" || value === 1;
    return padLeft(b ? "1" : "0", WORD);
  }

  // uint variants (uint8..uint256)
  if (type.startsWith("uint")) {
    return uint256Hex(BigInt(value));
  }

  // int variants (int8..int256)
  if (type.startsWith("int")) {
    return uint256Hex(BigInt(value));
  }

  // bytesN (bytes1..bytes32) — right-padded
  if (type.startsWith("bytes") && /^bytes\d+$/.test(type)) {
    const size = parseInt(type.slice(5));
    const cleaned = String(value).replace("0x", "");
    return padRight(cleaned.slice(0, size * 2), WORD);
  }

  // string (dynamic)
  if (type === "string") {
    const bytes = new TextEncoder().encode(String(value));
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const length = uint256Hex(BigInt(bytes.length));
    const paddedWords = Math.ceil(bytes.length / WORD) || 1;
    const paddedData = padRight(hex, paddedWords * WORD);
    return length + paddedData;
  }

  // bytes (dynamic)
  if (type === "bytes") {
    const cleaned = String(value).replace("0x", "");
    const byteLen = cleaned.length / 2;
    const length = uint256Hex(BigInt(byteLen));
    const paddedWords = Math.ceil(byteLen / WORD) || 1;
    const paddedData = padRight(cleaned, paddedWords * WORD);
    return length + paddedData;
  }

  throw new Error(
    `Unsupported ABI type: ${type}. Only uint/int, address, bool, string, bytes, and bytesN are supported. Use hex mode for complex types.`
  );
}

function encodeParams(types: string[], values: any[]): string {
  const headSize = types.length * WORD;
  const heads: string[] = [];
  const tails: string[] = [];
  let tailOffset = headSize;

  for (let i = 0; i < types.length; i++) {
    if (isDynamic(types[i])) {
      heads.push(uint256Hex(BigInt(tailOffset)));
      const tail = encodeSingle(types[i], values[i]);
      tails.push(tail);
      tailOffset += tail.length / 2; // hex chars → bytes
    } else {
      heads.push(encodeSingle(types[i], values[i]));
    }
  }

  return heads.join("") + tails.join("");
}

/**
 * Check if a Solidity type is supported by the typed constructor form.
 * Returns false for arrays, tuples, and any complex/nested types.
 */
export function isSupportedType(type: string): boolean {
  if (type === "address" || type === "bool" || type === "string" || type === "bytes") {
    return true;
  }
  if (type.startsWith("uint") && /^uint\d*$/.test(type)) return true;
  if (type.startsWith("int") && /^int\d*$/.test(type)) return true;
  if (/^bytes\d+$/.test(type)) return true;
  return false;
}

/**
 * Check if ALL constructor inputs in an ABI are supported by the typed form.
 */
export function allConstructorTypesSupported(abi: any[]): boolean {
  const inputs = getConstructorInputs(abi);
  return inputs.every((input) => isSupportedType(input.type));
}

/**
 * ABI-encode constructor arguments from an ABI definition.
 * Returns hex string WITH 0x prefix, or "0x" if no constructor args.
 * Throws if any type is unsupported — caller must check isSupportedType() first.
 */
export function encodeConstructorArgs(
  abi: any[],
  values: Record<string, any>
): string {
  const ctor = abi.find((item) => item.type === "constructor");
  if (!ctor || !ctor.inputs || ctor.inputs.length === 0) return "0x";

  const types = ctor.inputs.map((input: any) => input.type);
  const ordered = ctor.inputs.map((input: any) => values[input.name] ?? "");

  const encoded = encodeParams(types, ordered);
  return encoded ? `0x${encoded}` : "0x";
}

/**
 * Get constructor input definitions from an ABI.
 */
export function getConstructorInputs(
  abi: any[]
): { name: string; type: string; indexed?: boolean }[] {
  const ctor = abi.find((item) => item.type === "constructor");
  if (!ctor || !ctor.inputs) return [];
  return ctor.inputs;
}

/**
 * Map a Solidity ABI type to a human-readable description for input labels.
 */
export function solidityTypeLabel(type: string): string {
  if (type === "address") return "Address (0x...)";
  if (type === "bool") return "Boolean";
  if (type === "string") return "String";
  if (type === "bytes") return "Bytes (0x...)";
  if (type.startsWith("uint")) return `Unsigned integer (${type})`;
  if (type.startsWith("int")) return `Signed integer (${type})`;
  if (/^bytes\d+$/.test(type)) return `Fixed bytes (${type})`;
  return type;
}
