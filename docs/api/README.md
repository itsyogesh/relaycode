# API Reference

This documentation covers the core APIs used in Relaycode for building, encoding, decoding, and validating Substrate extrinsics.

## Core Modules

### [Codec API](./codec.md)
Encoding and decoding functions for converting between form values and SCALE-encoded hex data.

- `encodeArg()` - Encode a single value to hex
- `decodeArg()` - Decode hex to a form value
- `encodeAllArgs()` - Bulk encode all extrinsic arguments
- `decodeAllArgs()` - Bulk decode concatenated argument hex

### [Validation API](./validation.md)
Input validation utilities for form fields and complex types.

- `validateAllArgs()` - Validate all extrinsic arguments
- `validateField()` - Validate a single field by type
- `validateAmount()` - Numeric amount validation
- `isValidAddressFormat()` - SS58 address format check
- `isValidHexFormat()` - Hex string format check

### [Parser API](./parser.md)
Metadata parsing utilities for working with Dedot client metadata.

- `createSectionOptions()` - Generate pallet options from metadata
- `createMethodOptions()` - Generate method options for a pallet
- `getArgType()` - Retrieve type information for arguments

### [Input Map API](./input-map.md)
Type resolution system for mapping Substrate types to UI components.

- `findComponent()` - Find the appropriate input component for a type
- Priority-based pattern matching
- Custom type handler registration

## Architecture

Relaycode uses [Dedot](https://github.com/dedotdev/dedot) as its Polkadot client library. All encoding/decoding operations leverage Dedot's codec registry, which provides type-safe SCALE encoding based on chain metadata.

```
┌─────────────────────────────────────────────────────────────┐
│                    Extrinsic Builder UI                      │
├─────────────────────────────────────────────────────────────┤
│  Input Components  │  Validation  │  Encoding/Decoding      │
│  (params/inputs/)  │  (lib/)      │  (lib/codec.ts)         │
├─────────────────────────────────────────────────────────────┤
│                     Dedot Client                             │
│            (metadata, registry, codecs)                      │
├─────────────────────────────────────────────────────────────┤
│                   Substrate Chain                            │
└─────────────────────────────────────────────────────────────┘
```

## Usage Pattern

```typescript
import { DedotClient } from "dedot";
import { encodeArg, decodeArg, validateField } from "@/lib";

// 1. Connect to chain
const client = await DedotClient.new("wss://rpc.polkadot.io");

// 2. Validate input
const validation = validateField("Balance", "1000000000000", "amount");
if (!validation.valid) {
  console.error(validation.error);
}

// 3. Encode for submission
const result = encodeArg(client, typeId, value);
if (result.success) {
  console.log("Encoded:", result.hex);
}

// 4. Decode for display
const decoded = decodeArg(client, typeId, hex);
if (decoded.success) {
  console.log("Decoded:", decoded.value);
}
```

## Type Safety

All APIs are fully typed with TypeScript. The Dedot client provides chain-specific type information through its generic parameter:

```typescript
import { DedotClient } from "dedot";
import { PolkadotApi } from "@dedot/chaintypes";

const client: DedotClient<PolkadotApi> = await DedotClient.new("wss://rpc.polkadot.io");
```
