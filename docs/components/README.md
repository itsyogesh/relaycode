# Component Reference

This documentation covers the input components used in the Relaycode extrinsic builder. Each component handles a specific Substrate type and provides appropriate UI controls for user input.

## Architecture Overview

### Input Component System

All input components live in `components/params/inputs/` and share a common interface:

```
components/params/
├── types.ts           # ParamInputProps interface
└── inputs/
    ├── account.tsx    # SS58 address input
    ├── amount.tsx     # Integer numeric input
    ├── balance.tsx    # Token amount with denominations
    ├── boolean.tsx    # Boolean toggle
    ├── bytes.tsx      # Hex byte array
    ├── call.tsx       # Nested extrinsic builder
    ├── enum.tsx       # Variant selector
    ├── hash.tsx       # H256/H160/H512 input
    ├── option.tsx     # Optional value wrapper
    ├── struct.tsx     # Composite type container
    ├── text.tsx       # String/fallback input
    ├── tuple.tsx      # Positional collection
    └── vector.tsx     # Dynamic array
```

### ParamInputProps Interface

All input components implement this common interface:

```typescript
interface ParamInputProps {
  name: string;                    // Field identifier
  label?: string;                  // Display label
  description?: string;            // Help text
  isDisabled?: boolean;            // Disable input
  isRequired?: boolean;            // Show required indicator
  error?: string;                  // Error message to display
  client: DedotClient<PolkadotApi>; // Dedot client for type resolution
  typeId?: number;                 // Type ID for complex type resolution
  onChange?: (value: unknown) => void;  // Value change callback
}
```

### Component Schema Pattern

Each component exports a Zod validation schema:

```typescript
// Example from amount.tsx
import { z } from "zod";

const schema = z.string().refine(
  (val) => !isNaN(Number(val)) && Number(val) >= 0,
  { message: "Must be a non-negative number" }
);

export function Amount({ ... }) { ... }

Amount.schema = schema;
```

## Component Categories

### Primitive Types
- [AccountInput](./inputs.md#accountinput) - SS58 addresses
- [AmountInput](./inputs.md#amountinput) - Integers
- [BalanceInput](./inputs.md#balanceinput) - Token amounts
- [BoolInput](./inputs.md#boolinput) - Booleans
- [TextInput](./inputs.md#textinput) - Strings

### Binary Types
- [BytesInput](./inputs.md#bytesinput) - Byte arrays
- [HashInput](./inputs.md#hashinput) - Fixed-size hashes

### Composite Types
- [StructInput](./inputs.md#structinput) - Named field objects
- [TupleInput](./inputs.md#tupleinput) - Positional arrays
- [VectorInput](./inputs.md#vectorinput) - Dynamic arrays
- [OptionInput](./inputs.md#optioninput) - Optional values
- [EnumInput](./inputs.md#enuminput) - Variant types

### Special Types
- [CallInput](./inputs.md#callinput) - Nested extrinsics

## Type Resolution

Components are resolved from type names using the [Input Map API](../api/input-map.md):

```typescript
import { findComponent } from "@/lib/input-map";

// Find component for a Balance type
const { component: BalanceComponent } = findComponent("Balance");

// Find component with typeId for nested resolution
const { component: VecComponent } = findComponent("Vec<AccountId>", typeId);
```

## Value Flow

```
User Input → Component onChange() → Parent Form State → Encoding
                                         ↓
Decoding → Parent Form State → Component value prop → Display
```

### onChange Callback

Components call `onChange` with the appropriate value type:

| Component | onChange Value Type |
|-----------|---------------------|
| Account | `string` (SS58 address) |
| Amount | `string` (integer as string) |
| Balance | `string` (planck value as string) |
| Boolean | `boolean` |
| Bytes | `string` (hex with 0x) |
| Hash | `string` (hex with 0x) |
| Text | `string` |
| Option | `undefined` or inner value |
| Vector | `unknown[]` |
| Struct | `Record<string, unknown>` |
| Tuple | `unknown[]` |
| Enum | `{ type: string; value?: unknown }` |
| Call | `{ type: string; value: { type: string; ...args } }` |

## UI Components

Input components are built on [shadcn/ui](https://ui.shadcn.com/) primitives:

- `Input` - Text fields
- `Select` - Dropdowns
- `Switch` - Toggles
- `Button` - Actions
- `Card` - Containers
- `Label` - Field labels
- `FormDescription` - Help text

## Custom Hooks

Components use several custom hooks:

### useSS58
Address formatting with chain-specific prefix:
```typescript
const { ss58Prefix, formatAddress, isValidAddress, truncateAddress } = useSS58(client);
```

### useChainToken
Token symbol and denominations:
```typescript
const { symbol, decimals, denominations, existentialDeposit } = useChainToken(client);
```

### useRecentAddresses
Recently used address history:
```typescript
const { recentAddresses, addRecent } = useRecentAddresses();
```

### useSafeAccounts / useSafeBalance
Wallet integration (safe fallbacks when wallet not connected):
```typescript
const { accounts } = useSafeAccounts();
const { transferable, formattedTransferable } = useSafeBalance({ address });
```

## See Also

- [Input Components Reference](./inputs.md) - Detailed documentation for each component
- [Input Map API](../api/input-map.md) - Type resolution system
- [Validation API](../api/validation.md) - Input validation utilities
