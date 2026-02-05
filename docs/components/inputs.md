# Input Components Reference

Detailed documentation for each input component in the Relaycode extrinsic builder.

## AccountInput

**File:** `components/params/inputs/account.tsx`

**Handles:** `AccountId`, `AccountId32`, `AccountId20`, `MultiAddress`, `Address`, `LookupSource`

SS58 address input with wallet integration, address validation, and recent address history.

### Features
- Combobox with search functionality
- Connected wallet accounts as options
- Recent addresses history
- Address validation using Dedot's `decodeAddress`
- Automatic SS58 prefix formatting
- Address truncation for display

### Props
Standard `ParamInputProps` interface.

### Value Type
`string` - SS58 formatted address

### Example Usage
```tsx
<Account
  client={client}
  name="dest"
  label="Destination"
  description="The account to receive the transfer"
  isRequired
  onChange={(address) => console.log(address)}
/>
```

### Screenshot
```
┌─────────────────────────────────────────────────────┐
│ Destination *                                       │
├─────────────────────────────────────────────────────┤
│ Select or paste an account...               ▾      │
├─────────────────────────────────────────────────────┤
│ ┌─ Connected ─────────────────────────────────────┐ │
│ │ Alice    5GrwvaEF...utQY                       │ │
│ │ Bob      5FHneW46...A9Yq                       │ │
│ └───────────────────────────────────────────────┘ │
│ ┌─ Recent ────────────────────────────────────────┐ │
│ │ 5DAAnrj7...8BdV                                │ │
│ └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## AmountInput

**File:** `components/params/inputs/amount.tsx`

**Handles:** `u8`, `u16`, `u32`, `u64`, `u128`, `i8`, `i16`, `i32`, `i64`, `i128`, `Compact<uN>`

Integer numeric input for unsigned and signed integer types.

### Features
- Numeric input with validation
- Supports large integers (BigInt for u128)
- Non-negative validation for unsigned types

### Props
Standard `ParamInputProps` interface.

### Value Type
`string` - Integer value as string (for BigInt compatibility)

### Example Usage
```tsx
<Amount
  client={client}
  name="index"
  label="Index"
  description="A u32 index value"
  onChange={(value) => console.log(value)}
/>
```

---

## BalanceInput

**File:** `components/params/inputs/balance.tsx`

**Handles:** `Balance`, `BalanceOf`

Token amount input with denomination selector and wallet balance display.

### Features
- Denomination selector (DOT, mDOT, planck, etc.)
- Automatic conversion to planck for encoding
- Connected wallet balance display
- "Max" button (balance minus existential deposit)
- Existential deposit warning
- Precision validation per denomination

### Props
Standard `ParamInputProps` interface.

### Value Type
`string` - Amount in planck (smallest unit) as string

### Example Usage
```tsx
<Balance
  client={client}
  name="value"
  label="Amount"
  description="The amount to transfer"
  isRequired
  onChange={(planck) => console.log(planck)}
/>
```

### Screenshot
```
┌─────────────────────────────────────────────────────┐
│ Amount *                                            │
├───────────────────────────────────────────┬────────┤
│ 1.5                                       │ DOT  ▾ │
├───────────────────────────────────────────┴────────┤
│ Available: 10.5 DOT                          [Max] │
├─────────────────────────────────────────────────────┤
│ ⚠ Amount would reap account (ED: 1 DOT)            │
└─────────────────────────────────────────────────────┘
```

---

## BoolInput

**File:** `components/params/inputs/boolean.tsx`

**Handles:** `bool`

Boolean toggle switch.

### Features
- Simple on/off toggle using Switch component
- Clear true/false labeling

### Props
Standard `ParamInputProps` interface.

### Value Type
`boolean`

### Example Usage
```tsx
<Boolean
  client={client}
  name="keepAlive"
  label="Keep Alive"
  description="Whether to keep the source account alive"
  onChange={(value) => console.log(value)}
/>
```

---

## BytesInput

**File:** `components/params/inputs/bytes.tsx`

**Handles:** `Bytes`, `Vec<u8>`

Hex byte array input.

### Features
- Hex string input with 0x prefix
- Format validation
- Supports arbitrary length

### Props
Standard `ParamInputProps` interface.

### Value Type
`string` - Hex string with 0x prefix

### Example Usage
```tsx
<Bytes
  client={client}
  name="data"
  label="Data"
  description="Arbitrary bytes to include"
  onChange={(hex) => console.log(hex)}
/>
```

---

## CallInput

**File:** `components/params/inputs/call.tsx`

**Handles:** `Call`, `RuntimeCall`, `Box<RuntimeCall>`

Nested extrinsic builder for batch calls and sudo operations.

### Features
- Pallet selector (from chain metadata)
- Method selector (filtered by selected pallet)
- Dynamic parameter inputs based on method signature
- Full recursive type resolution
- Builds Dedot-compatible call structure

### Props
Standard `ParamInputProps` interface.

### Value Type
```typescript
{
  type: string;  // Pallet name (camelCase)
  value: {
    type: string;  // Method name (camelCase)
    [argName: string]: unknown;  // Method arguments
  }
}
```

### Example Usage
```tsx
<Call
  client={client}
  name="call"
  label="Inner Call"
  description="The call to execute via sudo"
  onChange={(callValue) => console.log(callValue)}
/>
```

### Screenshot
```
┌─────────────────────────────────────────────────────┐
│ Inner Call                                          │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Pallet                          [Balances    ▾] │ │
│ │ Method                    [transferKeepAlive ▾] │ │
│ │─────────────────────────────────────────────────│ │
│ │ Parameters                                      │ │
│ │   dest: [________________________]              │ │
│ │   value: [____________] [DOT ▾]                 │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## EnumInput

**File:** `components/params/inputs/enum.tsx`

**Handles:** Enum types from metadata

Variant selector with optional inner value input.

### Features
- Dropdown for variant selection
- Dynamic inner component based on variant
- Supports unit variants (no value)
- Supports variants with associated data

### Props
Extended interface:
```typescript
interface EnumProps extends ParamInputProps {
  variants: {
    name: string;
    component?: React.ReactNode;  // Inner input for this variant
  }[];
}
```

### Value Type
```typescript
{
  type: string;       // Variant name
  value?: unknown;    // Associated data (if any)
}
```

### Example Usage
```tsx
<Enum
  client={client}
  name="origin"
  label="Origin"
  variants={[
    { name: "Root" },
    { name: "Signed", component: <Account {...} /> },
  ]}
  onChange={(value) => console.log(value)}
/>
```

---

## HashInput

**File:** `components/params/inputs/hash.tsx`

**Handles:** `H256`, `H160`, `H512`, `Hash`, `BlockHash`, `ExtrinsicHash`

Fixed-size hash input (32 bytes for H256).

### Features
- Hex input with 0x prefix
- Length validation (66 chars for H256)
- Format validation

### Props
Standard `ParamInputProps` interface.

### Value Type
`string` - Hex string with 0x prefix

### Example Usage
```tsx
<Hash256
  client={client}
  name="hash"
  label="Block Hash"
  description="The hash of the target block"
  onChange={(hash) => console.log(hash)}
/>
```

---

## OptionInput

**File:** `components/params/inputs/option.tsx`

**Handles:** `Option<T>`

Optional value wrapper with enable/disable toggle.

### Features
- Toggle switch to enable/disable the value
- Wraps any inner component
- Disabled state dims and disables inner input
- Returns `undefined` when disabled

### Props
Extended interface:
```typescript
interface OptionProps extends ParamInputProps {
  children: React.ReactNode;  // The inner input component
}
```

### Value Type
`undefined` (disabled) or inner value type (enabled)

### Example Usage
```tsx
<Option
  client={client}
  name="maybeRecipient"
  label="Recipient (Optional)"
  onChange={(value) => console.log(value)}
>
  <Account client={client} name="recipient" />
</Option>
```

### Screenshot
```
┌─────────────────────────────────────────────────────┐
│ Recipient (Optional)                     [  ON  ]   │
├─────────────────────────────────────────────────────┤
│ [Select account...                              ▾] │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Recipient (Optional)                     [ OFF  ]   │
├─────────────────────────────────────────────────────┤
│ [Select account...                              ▾] │  ← Dimmed
└─────────────────────────────────────────────────────┘
```

---

## StructInput

**File:** `components/params/inputs/struct.tsx`

**Handles:** Struct/composite types from metadata

Named field container for composite types.

### Features
- Card-based grouping of fields
- Required field validation
- Dynamic field components via children

### Props
Extended interface:
```typescript
interface StructProps extends ParamInputProps {
  fields: {
    name: string;
    label: string;
    description?: string;
    component: React.ReactNode;
    required?: boolean;
  }[];
}
```

### Value Type
`Record<string, unknown>` - Object with field values

### Example Usage
```tsx
<Struct
  client={client}
  name="proposal"
  label="Proposal"
  fields={[
    { name: "title", label: "Title", component: <Text {...} />, required: true },
    { name: "description", label: "Description", component: <Text {...} /> },
    { name: "budget", label: "Budget", component: <Balance {...} />, required: true },
  ]}
  onChange={(values) => console.log(values)}
/>
```

---

## TextInput

**File:** `components/params/inputs/text.tsx`

**Handles:** `String`, `Text`, and fallback for unknown types

Basic string input field.

### Features
- Simple text input
- Used as fallback for unrecognized types

### Props
Standard `ParamInputProps` interface.

### Value Type
`string`

### Example Usage
```tsx
<Text
  client={client}
  name="remark"
  label="Remark"
  description="A text remark to include"
  onChange={(text) => console.log(text)}
/>
```

---

## TupleInput

**File:** `components/params/inputs/tuple.tsx`

**Handles:** `(T1, T2, ...)`, Tuple types

Positional collection of typed elements.

### Features
- Resolves element types from registry using typeId
- Dynamic component resolution for each element
- Card-based layout with numbered elements

### Props
Extended interface:
```typescript
interface TupleProps extends ParamInputProps {
  typeId: number;  // Required for type resolution
}
```

### Value Type
`unknown[]` - Array with values at each position

### Example Usage
```tsx
<Tuple
  client={client}
  name="pair"
  label="Key-Value Pair"
  typeId={tupleTypeId}
  onChange={(values) => console.log(values)}
/>
```

### Screenshot
```
┌─────────────────────────────────────────────────────┐
│ Key-Value Pair                                      │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Element 0                                       │ │
│ │ sp_core::H256                                   │ │
│ │ [0x________________________________]            │ │
│ │                                                 │ │
│ │ Element 1                                       │ │
│ │ Vec<u8>                                         │ │
│ │ [0x________________________________]            │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## VectorInput

**File:** `components/params/inputs/vector.tsx`

**Handles:** `Vec<T>`, `BoundedVec<T, S>`

Dynamic array input with add/remove functionality.

### Features
- Add/remove items dynamically
- Min/max items constraints
- Empty item detection and validation
- Trash icon for item removal

### Props
Extended interface:
```typescript
interface VectorProps extends ParamInputProps {
  children: React.ReactNode;  // Template component for items
  minItems?: number;
  maxItems?: number;
}
```

### Value Type
`unknown[]` - Array of item values

### Example Usage
```tsx
<Vector
  client={client}
  name="recipients"
  label="Recipients"
  minItems={1}
  maxItems={10}
  onChange={(values) => console.log(values)}
>
  <Account client={client} name="recipient" />
</Vector>
```

### Screenshot
```
┌─────────────────────────────────────────────────────┐
│ Recipients (min: 1, max: 10)            [+ Add Item] │
├─────────────────────────────────────────────────────┤
│ [5GrwvaEF...utQY                            ▾] [🗑]  │
│ [5FHneW46...A9Yq                            ▾] [🗑]  │
│ [Select account...                          ▾] [🗑]  │
└─────────────────────────────────────────────────────┘
```

---

## Creating Custom Components

To create a new input component:

```typescript
// components/params/inputs/my-custom.tsx
"use client";

import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDescription } from "@/components/ui/form";
import type { ParamInputProps } from "../types";

// 1. Define validation schema
const schema = z.string().min(1, "Value is required");

// 2. Create the component
export function MyCustom({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  client,
  onChange,
}: ParamInputProps) {
  const [value, setValue] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        value={value}
        onChange={handleChange}
        disabled={isDisabled}
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// 3. Attach schema
MyCustom.schema = schema;
```

Then register in `lib/input-map.ts`:

```typescript
import { MyCustom } from "@/components/params/inputs/my-custom";

const registry = [
  {
    component: MyCustom,
    schema: MyCustom.schema,
    patterns: ["MyCustomType"],
    priority: 85,
  },
  // ... existing registrations
];
```
