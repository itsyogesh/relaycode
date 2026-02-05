# Codec API

The codec module (`lib/codec.ts`) provides functions for encoding form values to SCALE-encoded hex and decoding hex back to form values. All operations use the Dedot client's codec registry for type-safe encoding.

## Types

### EncodeResult

```typescript
type EncodeResult =
  | { success: true; hex: string }
  | { success: false; hex: "0x"; error: string };
```

### DecodeResult

```typescript
type DecodeResult =
  | { success: true; value: unknown; bytesConsumed: number }
  | { success: false; error: string };
```

### EncodeAllResult

```typescript
interface EncodeAllResult {
  argResults: EncodeResult[];     // Individual results per argument
  argHexes: string[];             // Individual hex strings
  concatenated: string;           // Combined hex for all args
  hasErrors: boolean;             // True if any encoding failed
  errors: Map<string, string>;    // Field name -> error message
}
```

### DecodeAllResult

```typescript
interface DecodeAllResult {
  success: boolean;               // True if all decoding succeeded
  values: Record<string, unknown> | null;  // Decoded values by field name
  errors: Map<string, string>;    // Field name -> error message
  totalBytesConsumed: number;     // Bytes consumed from input
}
```

## Functions

### encodeArg()

Encode a single form value to hex using the field's typeId from metadata.

```typescript
function encodeArg(
  client: DedotClient<any>,
  typeId: number,
  value: unknown
): EncodeResult
```

**Parameters:**
- `client` - Connected Dedot client instance
- `typeId` - The type ID from chain metadata
- `value` - The form value to encode (string, number, object, etc.)

**Returns:** `EncodeResult` with success status and hex or error

**Example:**
```typescript
import { encodeArg } from "@/lib/codec";

// Encode a balance value
const result = encodeArg(client, 6, "1000000000000");
if (result.success) {
  console.log(result.hex); // "0x0010a5d4e800"
} else {
  console.error(result.error);
}

// Encode an account address
const accountResult = encodeArg(client, 0, "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
```

**Notes:**
- Form values (always strings) are automatically coerced to appropriate types (BigInt for numbers, boolean for "true"/"false")
- The codec is resolved from the client's registry using the typeId

### decodeArg()

Decode hex back to a form value using the field's typeId from metadata.

```typescript
function decodeArg(
  client: DedotClient<any>,
  typeId: number,
  hex: string
): DecodeResult
```

**Parameters:**
- `client` - Connected Dedot client instance
- `typeId` - The type ID from chain metadata
- `hex` - The hex string to decode (with 0x prefix)

**Returns:** `DecodeResult` with success status, decoded value, and bytes consumed

**Example:**
```typescript
import { decodeArg } from "@/lib/codec";

// Decode a balance value
const result = decodeArg(client, 6, "0x0010a5d4e800");
if (result.success) {
  console.log(result.value);         // "1000000000000"
  console.log(result.bytesConsumed); // 16
}
```

**Notes:**
- BigInt values are automatically converted to strings for form compatibility
- The `bytesConsumed` field indicates how many bytes were read from the input

### encodeAllArgs()

Encode all form arguments for an extrinsic, returning individual and concatenated results.

```typescript
function encodeAllArgs(
  client: DedotClient<any>,
  fields: readonly { name?: string; typeId: number }[],
  formValues: Record<string, unknown>
): EncodeAllResult
```

**Parameters:**
- `client` - Connected Dedot client instance
- `fields` - Array of field definitions with name and typeId
- `formValues` - Object mapping field names to form values

**Returns:** `EncodeAllResult` with per-field results and concatenated hex

**Example:**
```typescript
import { encodeAllArgs } from "@/lib/codec";

// Encode a transfer call's arguments
const fields = [
  { name: "dest", typeId: 113 },   // MultiAddress
  { name: "value", typeId: 6 },    // Balance
];

const formValues = {
  dest: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  value: "1000000000000",
};

const result = encodeAllArgs(client, fields, formValues);

if (!result.hasErrors) {
  console.log(result.concatenated);  // Full args hex
  console.log(result.argHexes);      // Individual hex per arg
} else {
  result.errors.forEach((error, field) => {
    console.error(`${field}: ${error}`);
  });
}
```

### decodeAllArgs()

Decode concatenated argument hex back to individual form values.

```typescript
function decodeAllArgs(
  client: DedotClient<any>,
  fields: readonly { name?: string; typeId: number }[],
  hex: string
): DecodeAllResult
```

**Parameters:**
- `client` - Connected Dedot client instance
- `fields` - Array of field definitions with name and typeId
- `hex` - Concatenated arguments hex (with 0x prefix)

**Returns:** `DecodeAllResult` with decoded values or errors

**Example:**
```typescript
import { decodeAllArgs } from "@/lib/codec";

// Decode transfer arguments from hex
const fields = [
  { name: "dest", typeId: 113 },
  { name: "value", typeId: 6 },
];

const hex = "0x00d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d0010a5d4e800";

const result = decodeAllArgs(client, fields, hex);

if (result.success) {
  console.log(result.values);
  // { dest: { type: "Id", value: "5GrwvaEF..." }, value: "1000000000000" }
}
```

**Notes:**
- Decodes sequentially, consuming bytes from the buffer
- Validates that re-encoding produces the same bytes
- Warns if there are remaining bytes after decoding all fields

## Value Coercion

The codec module automatically coerces form string values to types expected by Dedot codecs:

| Form Value | Coerced Type |
|------------|--------------|
| `"true"` | `true` (boolean) |
| `"false"` | `false` (boolean) |
| `"12345"` | `12345n` (BigInt) |
| Other strings | Unchanged |

This allows form inputs (which always produce strings) to work seamlessly with the strongly-typed codec system.

## Error Handling

All functions return result objects rather than throwing exceptions. Check the `success` field before accessing values:

```typescript
const result = encodeArg(client, typeId, value);

if (result.success) {
  // Safe to use result.hex
  submitTransaction(result.hex);
} else {
  // Handle error
  showError(result.error);
}
```

Common error scenarios:
- Invalid type ID (not found in registry)
- Value doesn't match expected type
- Malformed hex string for decoding
- Insufficient bytes for decoding
