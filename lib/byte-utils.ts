/**
 * Shared hex/bytes/base64 conversion utilities.
 * Used by Bytes, VectorFixed, and other byte-oriented input components.
 */

export function bytesToHex(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array | null {
  const stripped = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (stripped.length === 0) return new Uint8Array(0);
  if (stripped.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]+$/.test(stripped)) return null;
  const bytes = new Uint8Array(stripped.length / 2);
  for (let i = 0; i < stripped.length; i += 2) {
    bytes[i / 2] = parseInt(stripped.slice(i, i + 2), 16);
  }
  return bytes;
}

export function tryDecodeUtf8(hex: string): string | null {
  const bytes = hexToBytes(hex);
  if (!bytes || bytes.length === 0) return null;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    // Reject if it contains control characters (except newline/tab) — likely binary
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text)) return null;
    return text;
  } catch {
    return null;
  }
}

export function base64ToBytes(b64: string): Uint8Array | null {
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
