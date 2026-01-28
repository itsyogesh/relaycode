# Input Components Specification

## Overview

This document specifies the input components needed for M2, their APIs, validation rules, and implementation details. Components are prioritized by usage frequency in common extrinsics.

---

## Priority Matrix

| Priority | Component | Common Use Cases | M2 Target |
|----------|-----------|------------------|-----------|
| P0 | AccountInput | All transfers, staking, governance | Yes |
| P0 | BalanceInput | Transfers, staking, tips | Yes |
| P0 | EnumInput | MultiAddress, RuntimeCall variants | Yes |
| P1 | OptionInput | Optional params everywhere | Yes |
| P1 | VectorInput | Batch calls, multi-sig | Yes |
| P1 | StructInput | Complex params | Yes |
| P2 | TupleInput | Paired values | Yes |
| P2 | HashInput | Governance proposals | Yes |
| P2 | CallInput | Utility.batch, Proxy | Stretch |
| P3 | BTreeMap | Storage queries | Post-M2 |

---

## Component Specifications

### 1. AccountInput (P0 - Critical)

**Purpose:** Handle Substrate account addresses with MultiAddress support

**Substrate Types Handled:**
- `AccountId32` - Standard 32-byte account
- `AccountId20` - Ethereum-compatible 20-byte
- `MultiAddress` - Enum of Id/Index/Raw/Address32/Address20
- `Address` - Legacy alias
- `LookupSource` - Chain-specific lookup

**UI Features:**
- SS58 address input with format validation
- Address format detection (Polkadot/Kusama/Generic)
- Copy button
- QR code scanner (stretch)
- ENS/Identity resolution (stretch)
- Identicon display

**Props:**
```typescript
interface AccountInputProps extends BaseParamProps {
  /** Allowed address formats */
  formats?: ("polkadot" | "kusama" | "generic")[];

  /** Show identicon */
  showIdenticon?: boolean;

  /** Allow index lookup (for MultiAddress) */
  allowIndex?: boolean;

  /** Custom address validation */
  validateAddress?: (address: string) => boolean | string;
}
```

**Validation (Zod):**
```typescript
const accountSchema = z.string()
  .min(1, "Address is required")
  .refine(
    (val) => isValidAddress(val),
    "Invalid Substrate address"
  );
```

**Example Usage:**
```tsx
<AccountInput
  control={control}
  name="dest"
  label="Destination"
  description="The account to receive the transfer"
  showIdenticon={true}
/>
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Destination                                                  │
│ ┌─────┬─────────────────────────────────────────────┬─────┐ │
│ │ [o] │ 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNo... │ [C] │ │
│ └─────┴─────────────────────────────────────────────┴─────┘ │
│ The account to receive the transfer                          │
└─────────────────────────────────────────────────────────────┘
  [o] = Identicon    [C] = Copy button
```

---

### 2. BalanceInput (P0 - Critical)

**Purpose:** Handle token amounts with unit conversion and formatting

**Substrate Types Handled:**
- `Balance` / `BalanceOf<T>`
- `Compact<Balance>`
- `Amount` (when used for tokens)

**UI Features:**
- Human-readable input (10.5 DOT)
- Planck conversion display
- Unit selector (DOT/planck toggle)
- Max balance button (when connected)
- Decimal validation based on chain

**Props:**
```typescript
interface BalanceInputProps extends BaseParamProps {
  /** Token symbol */
  symbol?: string;

  /** Decimal places (default: from chain) */
  decimals?: number;

  /** Show planck conversion */
  showPlanck?: boolean;

  /** Show max button */
  showMaxButton?: boolean;

  /** Max value for validation */
  maxValue?: bigint;

  /** Min value for validation */
  minValue?: bigint;
}
```

**Validation (Zod):**
```typescript
const balanceSchema = z.string()
  .refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    "Must be a valid positive number"
  )
  .transform((val) => parseBalanceToPlanck(val, decimals));
```

**Example Usage:**
```tsx
<BalanceInput
  control={control}
  name="value"
  label="Amount"
  symbol="DOT"
  decimals={10}
  showPlanck={true}
  showMaxButton={true}
/>
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Amount                                                       │
│ ┌───────────────────────────────────────────┬─────┬───────┐ │
│ │ 10.5                                      │ DOT │ [MAX] │ │
│ └───────────────────────────────────────────┴─────┴───────┘ │
│ = 105,000,000,000 planck                                     │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. EnumInput (P0 - Critical)

**Purpose:** Handle Rust enum types with variant selection and nested fields

**Substrate Types Handled:**
- Any `Enum<{...}>` type
- `MultiAddress` (special case)
- `RuntimeCall` variants
- `DispatchError` display

**UI Features:**
- Variant dropdown selector
- Dynamic nested fields based on variant
- Recursive rendering for nested enums
- Variant documentation display

**Props:**
```typescript
interface EnumInputProps extends TypeAwareParamProps {
  /** Enum variants from metadata */
  variants: EnumVariant[];

  /** Default selected variant */
  defaultVariant?: string;

  /** Hide variant selector (for single-variant) */
  hideSelector?: boolean;
}

interface EnumVariant {
  name: string;
  index: number;
  fields: EnumField[];
  docs?: string;
}
```

**Example - MultiAddress:**
```typescript
// MultiAddress variants
const multiAddressVariants = [
  { name: "Id", index: 0, fields: [{ type: "AccountId32" }] },
  { name: "Index", index: 1, fields: [{ type: "Compact<u32>" }] },
  { name: "Raw", index: 2, fields: [{ type: "Vec<u8>" }] },
  { name: "Address32", index: 3, fields: [{ type: "[u8; 32]" }] },
  { name: "Address20", index: 4, fields: [{ type: "[u8; 20]" }] },
];
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Destination (MultiAddress)                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Variant: [Id                               ▼]           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ AccountId                                                │ │
│ │ ┌─────┬─────────────────────────────────────────┬─────┐ │ │
│ │ │ [o] │ 5GrwvaEF5zXb26Fz9rcQpDWS57CtERH...     │ [C] │ │ │
│ │ └─────┴─────────────────────────────────────────┴─────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. OptionInput (P1)

**Purpose:** Wrap any input type to make it optional (Some/None)

**Substrate Types Handled:**
- `Option<T>` for any T
- `Maybe<T>`

**UI Features:**
- Toggle switch for Some/None
- Renders wrapped component when Some
- Clear visual indication of None state

**Props:**
```typescript
interface OptionInputProps extends TypeAwareParamProps {
  /** The inner type definition */
  innerType: string;

  /** Default to Some or None */
  defaultSome?: boolean;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Tip Amount (Optional)                     [Some ○──● None]  │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (Disabled/hidden when None)                             │ │
│ │ ┌───────────────────────────────────────────┬─────────┐ │ │
│ │ │ 1.0                                       │   DOT   │ │ │
│ │ └───────────────────────────────────────────┴─────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. VectorInput (P1)

**Purpose:** Handle dynamic arrays of items

**Substrate Types Handled:**
- `Vec<T>` for any T
- `BoundedVec<T, S>` with size limits

**UI Features:**
- Add/remove item buttons
- Drag-to-reorder (stretch)
- Item count display
- Bounded vec max indicator

**Props:**
```typescript
interface VectorInputProps extends TypeAwareParamProps {
  /** The item type */
  itemType: string;

  /** Minimum items */
  minItems?: number;

  /** Maximum items (for BoundedVec) */
  maxItems?: number;

  /** Allow reordering */
  allowReorder?: boolean;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Calls (Vec<RuntimeCall>)                     3 items / 10   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [1] ┌─────────────────────────────────────────┐ [x] [↕] │ │
│ │     │ System.remark                           │         │ │
│ │     │ remark: "Hello"                         │         │ │
│ │     └─────────────────────────────────────────┘         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [2] ┌─────────────────────────────────────────┐ [x] [↕] │ │
│ │     │ Balances.transferKeepAlive              │         │ │
│ │     │ dest: 5Grw...  value: 10 DOT            │         │ │
│ │     └─────────────────────────────────────────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                              [+ Add Item]   │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. StructInput (P1)

**Purpose:** Handle composite struct types with multiple named fields

**Substrate Types Handled:**
- Named struct types from metadata
- Inline struct definitions

**UI Features:**
- Collapsible field groups
- Field-level validation
- Documentation per field

**Props:**
```typescript
interface StructInputProps extends TypeAwareParamProps {
  /** Struct fields from metadata */
  fields: StructField[];

  /** Collapse by default */
  defaultCollapsed?: boolean;
}

interface StructField {
  name: string;
  type: string;
  docs?: string;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ ▼ ProxyDefinition                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ delegate                                                 │ │
│ │ ┌─────┬────────────────────────────────────────┬──────┐ │ │
│ │ │ [o] │ 5GrwvaEF5zXb26Fz9rcQpDWS57CtERH...    │ [C]  │ │ │
│ │ └─────┴────────────────────────────────────────┴──────┘ │ │
│ │                                                          │ │
│ │ proxyType                                                │ │
│ │ ┌────────────────────────────────────────────────────┐  │ │
│ │ │ [Any                                          ▼]   │  │ │
│ │ └────────────────────────────────────────────────────┘  │ │
│ │                                                          │ │
│ │ delay                                                    │ │
│ │ ┌────────────────────────────────────────────────────┐  │ │
│ │ │ 0                                                  │  │ │
│ │ └────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. TupleInput (P2)

**Purpose:** Handle fixed-size tuples with heterogeneous types

**Substrate Types Handled:**
- `(T1, T2, ...)` tuple syntax
- Named tuples from metadata

**Props:**
```typescript
interface TupleInputProps extends TypeAwareParamProps {
  /** Tuple element types */
  elementTypes: string[];
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ (AccountId, Balance)                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [0] Account                                              │ │
│ │ ┌─────┬────────────────────────────────────────┬──────┐ │ │
│ │ │ [o] │ 5GrwvaEF5zXb26Fz9rcQpDWS57CtERH...    │ [C]  │ │ │
│ │ └─────┴────────────────────────────────────────┴──────┘ │ │
│ │                                                          │ │
│ │ [1] Balance                                              │ │
│ │ ┌───────────────────────────────────────────┬─────────┐ │ │
│ │ │ 10.5                                      │   DOT   │ │ │
│ │ └───────────────────────────────────────────┴─────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. HashInput (P2)

**Purpose:** Handle cryptographic hash types

**Substrate Types Handled:**
- `H256` - 32-byte hash
- `H160` - 20-byte hash (Ethereum)
- `H512` - 64-byte hash
- `BlockHash`, `ExtrinsicHash`

**UI Features:**
- Hex input with 0x prefix
- Length validation
- Copy button
- Paste from clipboard

**Props:**
```typescript
interface HashInputProps extends BaseParamProps {
  /** Hash length in bytes */
  length: 20 | 32 | 64;

  /** Show shortened version */
  truncate?: boolean;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Proposal Hash (H256)                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 0x │ a1b2c3d4e5f6...                              │ [C] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 32 bytes required                                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 9. CallInput (P2 - Stretch)

**Purpose:** Handle nested extrinsic calls (for utility.batch, proxy, etc.)

**Substrate Types Handled:**
- `RuntimeCall` / `Call`
- `Box<RuntimeCall>`
- `OpaqueCall`

**UI Features:**
- Embedded mini extrinsic builder
- Collapsible for space
- Preview of encoded call

**Props:**
```typescript
interface CallInputProps extends TypeAwareParamProps {
  /** Allowed pallets (filter) */
  allowedPallets?: string[];

  /** Show encoded preview */
  showPreview?: boolean;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ ▼ Call (RuntimeCall)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────────────────┬───────────────────────────┐ │ │
│ │ │ Pallet: [Balances  ▼]   │ Method: [transfer    ▼]   │ │ │
│ │ └─────────────────────────┴───────────────────────────┘ │ │
│ │                                                          │ │
│ │ dest                                                     │ │
│ │ ┌─────┬────────────────────────────────────────┬──────┐ │ │
│ │ │ [o] │ 5GrwvaEF5zXb26Fz9rcQpDWS57CtERH...    │ [C]  │ │ │
│ │ └─────┴────────────────────────────────────────┴──────┘ │ │
│ │                                                          │ │
│ │ value                                                    │ │
│ │ ┌───────────────────────────────────────────┬─────────┐ │ │
│ │ │ 10.5                                      │   DOT   │ │ │
│ │ └───────────────────────────────────────────┴─────────┘ │ │
│ │                                                          │ │
│ │ Preview: 0x0503...d43593c715fdd31c61141abd04a99fd6... │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

### Week 1
1. **AccountInput** - Most critical, blocks wallet integration
2. **BalanceInput** - Second most used type

### Week 2
3. **EnumInput** - Enables MultiAddress, many other types
4. **OptionInput** - Simple wrapper, unlocks optional params
5. **VectorInput** - Enables batch calls

### Week 3
6. **StructInput** - Complex but necessary
7. **TupleInput** - Similar to struct
8. **HashInput** - Straightforward

### Stretch
9. **CallInput** - Complex, recursive, can defer

---

## Shared Utilities

### Balance Formatting

```typescript
// lib/format.ts

export function formatBalance(
  planck: bigint,
  decimals: number,
  symbol?: string
): string {
  const divisor = BigInt(10 ** decimals);
  const whole = planck / divisor;
  const fraction = planck % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");

  const formatted = fractionStr
    ? `${whole}.${fractionStr}`
    : whole.toString();

  return symbol ? `${formatted} ${symbol}` : formatted;
}

export function parseBalanceToPlanck(
  value: string,
  decimals: number
): bigint {
  const [whole, fraction = ""] = value.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
```

### Address Validation

```typescript
// lib/address.ts

import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

export function isValidAddress(address: string): boolean {
  try {
    decodeAddress(address);
    return true;
  } catch {
    return false;
  }
}

export function formatAddress(
  address: string,
  prefix: number = 0
): string {
  const decoded = decodeAddress(address);
  return encodeAddress(decoded, prefix);
}
```

---

## Related Documents

- [02-architecture.md](./02-architecture.md) - Component architecture
- [04-wallet-integration.md](./04-wallet-integration.md) - Wallet connection
- [05-testing-docs.md](./05-testing-docs.md) - Testing strategy
