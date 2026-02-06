# Input Map API

The input map module (`lib/input-map.ts`) provides a type resolution system that maps Substrate types to appropriate UI input components. It uses a priority-based pattern matching system to find the best component for each type.

## Functions

### findComponent()

Find the appropriate input component for a Substrate type.

```typescript
function findComponent(
  typeName: string,
  typeId?: number
): ParamComponentType & { typeId?: number }
```

**Parameters:**
- `typeName` - The type name from metadata (e.g., "AccountId", "Balance", "Vec<u8>")
- `typeId` - Optional type ID for complex types that need registry lookup

**Returns:** Object containing:
- `component` - The React component to render
- `schema` - Zod validation schema for the type
- `typeId` - The passed-through typeId (if provided)

**Example:**
```typescript
import { findComponent } from "@/lib/input-map";

// Simple type lookup
const { component: AccountComponent } = findComponent("AccountId");
// Returns: Account component

// Complex type with typeId
const { component: VectorComponent, typeId } = findComponent("Vec<Balance>", 123);
// Returns: Vector component with typeId for nested type resolution

// Unknown type falls back to Text
const { component: TextComponent } = findComponent("SomeUnknownType");
// Returns: Text component
```

## Type Resolution

The system uses a priority-based registry to match types. Higher priority patterns are checked first.

### Priority Order

| Priority | Component | Patterns |
|----------|-----------|----------|
| 100 | Account | `AccountId`, `AccountId32`, `AccountId20`, `MultiAddress`, `Address`, `LookupSource`, `/^AccountId/`, `/^MultiAddress/` |
| 95 | Balance | `Balance`, `BalanceOf`, `Compact<Balance>`, `Compact<BalanceOf>`, `/^Balance/` |
| 90 | Amount | `Compact<u128>`, `Compact<u64>`, `u128`, `u64`, `u32`, `u16`, `u8`, `i128`, `i64`, `i32`, `i16`, `i8`, `/Compact</` |
| 85 | Boolean | `bool` |
| 82 | Hash160 | `H160`, `/^H160$/` |
| 80 | Hash256 | `H256`, `Hash`, `/H256/`, `/Hash/` |
| 78 | Hash512 | `H512`, `/^H512$/` |
| 75 | Bytes | `Bytes`, `Vec<u8>`, `/Bytes/` |
| 70 | Call | `Call`, `RuntimeCall`, `/Call$/`, `/RuntimeCall>/` |
| 65 | Moment | `Moment`, `/Moment/` |
| 60 | Vote | `Vote`, `/^Vote$/` |
| 55 | VoteThreshold | `VoteThreshold`, `/VoteThreshold/` |
| 50 | KeyValue | `KeyValue`, `/KeyValue/` |
| 45 | Option | `/^Option</` |
| 43 | VectorFixed | `/^\[.+;\s*\d+\]$/` (e.g., `[u8; 32]`) |
| 42 | BTreeMap | `/^BTreeMap</` |
| 41 | BTreeSet | `/^BTreeSet</` |
| 40 | Vector | `/^Vec</`, `/^BoundedVec</` |
| 38 | Tuple | `/^\(/`, `/^Tuple/` |
| 35 | Struct | (no patterns - fallback for composite types) |
| 30 | Enum | (no patterns - fallback for enum types) |
| — | Text | (default fallback for unknown types) |

### Pattern Matching

Patterns can be:
- **Exact strings**: `"AccountId"` matches only `"AccountId"`
- **Regular expressions**: `/^AccountId/` matches `"AccountId"`, `"AccountIdOf"`, etc.

The system checks patterns in priority order, returning the first match.

**Example matches:**
```typescript
findComponent("AccountId");              // → Account (exact match, priority 100)
findComponent("AccountIdOf<T>");         // → Account (regex match, priority 100)
findComponent("Balance");                // → Balance (exact match, priority 95)
findComponent("Compact<Balance>");       // → Balance (exact match, priority 95)
findComponent("BalanceOf<T>");           // → Balance (regex match, priority 95)
findComponent("H160");                   // → Hash160 (exact match, priority 82)
findComponent("H512");                   // → Hash512 (exact match, priority 78)
findComponent("Vec<u8>");               // → Bytes (exact match, priority 75)
findComponent("[u8; 32]");              // → VectorFixed (regex match, priority 43)
findComponent("BTreeMap<u32, u64>");    // → BTreeMap (regex match, priority 42)
findComponent("BTreeSet<AccountId>");   // → BTreeSet (regex match, priority 41)
findComponent("Vec<AccountId>");        // → Vector (regex match, priority 40)
findComponent("Option<Balance>");       // → Option (regex match, priority 45)
findComponent("UnknownType");           // → Text (fallback)
```

## Component Registration

Components are registered in the `registry` array with the following structure:

```typescript
interface ComponentRegistration {
  component: React.ComponentType<any>;  // The React component
  schema: any;                          // Zod validation schema
  patterns: (string | RegExp)[];        // Matching patterns
  priority: number;                     // Higher = checked first
}
```

### Current Registry

```typescript
const registry: ComponentRegistration[] = [
  {
    component: Account,
    schema: Account.schema,
    patterns: ["AccountId", "AccountId32", "MultiAddress", /^AccountId/],
    priority: 100,
  },
  {
    component: Balance,
    schema: Balance.schema,
    patterns: ["Balance", "BalanceOf", /^Balance/],
    priority: 95,
  },
  // ... more registrations
];
```

## Usage in Components

The input map is typically used when dynamically rendering extrinsic parameters:

```typescript
import { findComponent } from "@/lib/input-map";

function ParameterInput({ field, client, onChange }) {
  const { component: Component, schema } = findComponent(
    field.typeName,
    field.typeId
  );

  return (
    <Component
      client={client}
      name={field.name}
      label={field.name}
      description={field.typeName}
      typeId={field.typeId}
      onChange={onChange}
    />
  );
}
```

### With Complex Types

For complex types like `Option<T>`, `Vec<T>`, or `Call`, the component uses the `typeId` to resolve nested types:

```typescript
// In Option component
function Option({ typeId, client, children, ...props }) {
  // If no children provided, resolve inner type from registry
  const innerType = useMemo(() => {
    if (children) return children;
    if (!client || !typeId) return null;

    const typeInfo = client.registry.findType(typeId);
    // Extract inner type and find its component
    const innerTypeId = typeInfo.typeDef.value.typeParam;
    const innerTypeName = client.registry.findType(innerTypeId).path?.join("::");

    return findComponent(innerTypeName, innerTypeId);
  }, [children, client, typeId]);

  // Render inner component
}
```

## Extending the Registry

To add support for a custom type:

1. Create the input component:
```typescript
// components/params/inputs/my-custom.tsx
import { z } from "zod";
import type { ParamInputProps } from "../types";

const schema = z.string();

export function MyCustom({ name, label, onChange, ...props }: ParamInputProps) {
  return (
    <div>
      {/* Your input UI */}
    </div>
  );
}

MyCustom.schema = schema;
```

2. Add to the registry in `lib/input-map.ts`:
```typescript
import { MyCustom } from "@/components/params/inputs/my-custom";

const registry: ComponentRegistration[] = [
  // Add before lower-priority entries
  {
    component: MyCustom,
    schema: MyCustom.schema,
    patterns: ["MyCustomType", /^MyCustom/],
    priority: 85,  // Choose appropriate priority
  },
  // ... existing entries
];
```

## Best Practices

1. **Choose appropriate priority**: Higher priority for more specific types
2. **Use exact strings for common types**: Faster matching than regex
3. **Use regex for type families**: e.g., `/^AccountId/` for all AccountId variants
4. **Provide meaningful fallbacks**: Unknown types fall back to Text input
5. **Include validation schema**: Each component should export a Zod schema

## Type Patterns Reference

Common Substrate type patterns and their expected components:

| Type | Component | Notes |
|------|-----------|-------|
| `AccountId`, `AccountId32` | Account | SS58 address input |
| `MultiAddress` | Account | Supports Id, Index, Raw variants |
| `Balance`, `BalanceOf<T>` | Balance | With denomination selector |
| `Compact<Balance>`, `Compact<BalanceOf>` | Balance | Compact-wrapped balances get denomination support |
| `Compact<u128>` | Amount | Integer input |
| `u32`, `u64`, `u128` | Amount | Unsigned integers |
| `bool` | Boolean | Toggle switch |
| `H160` | Hash160 | 20-byte hex input |
| `H256`, `BlockHash` | Hash256 | 32-byte hex input |
| `H512` | Hash512 | 64-byte hex input |
| `Vec<u8>`, `Bytes` | Bytes | Hex byte array |
| `[T; N]` | VectorFixed | Fixed-length array (e.g., `[u8; 32]`) |
| `BTreeMap<K, V>` | BTreeMap | Key-value pair list |
| `BTreeSet<T>` | BTreeSet | Unique value set |
| `Vec<T>` | Vector | Dynamic array |
| `Option<T>` | Option | Optional with toggle |
| `(T1, T2, ...)` | Tuple | Positional elements |
| `{ field: T }` | Struct | Named fields |
| `enum { A, B }` | Enum | Variant selector |
| `Call`, `RuntimeCall` | Call | Nested extrinsic |
