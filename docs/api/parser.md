# Parser API

The parser module (`lib/parser.ts`) provides utilities for working with Dedot client metadata, enabling the extrinsic builder to dynamically generate pallet and method options from chain metadata.

## Functions

### createSectionOptions()

Generate a list of pallet options from chain metadata.

```typescript
function createSectionOptions(
  metadata: Metadata["latest"] | null
): { text: string; value: number; docs: string[] }[] | null
```

**Parameters:**
- `metadata` - The latest metadata from a Dedot client (`client.metadata.latest`)

**Returns:** Array of pallet options sorted alphabetically by name, or `null` if metadata is unavailable

**Example:**
```typescript
import { createSectionOptions } from "@/lib/parser";

const client = await DedotClient.new("wss://rpc.polkadot.io");
const sections = createSectionOptions(client.metadata.latest);

// Returns array like:
// [
//   { value: 4, text: "Balances", docs: ["The Balances pallet provides..."] },
//   { value: 0, text: "System", docs: ["The System pallet provides..."] },
//   { value: 25, text: "Utility", docs: ["A utility pallet..."] },
//   ...
// ]

// Use in a select/dropdown
<Select>
  {sections?.map(section => (
    <SelectItem key={section.value} value={section.value.toString()}>
      {section.text}
    </SelectItem>
  ))}
</Select>
```

**Notes:**
- Only returns pallets that have callable extrinsics (filters out pallets without `calls`)
- Results are sorted alphabetically by pallet name
- The `value` is the pallet index used for call encoding
- The `docs` array contains pallet documentation from metadata

### createMethodOptions()

Generate a list of method options for a specific pallet.

```typescript
function createMethodOptions(
  client: DedotClient<PolkadotApi>,
  sectionIndex: number
): { text: string; value: number }[] | null
```

**Parameters:**
- `client` - Connected Dedot client instance
- `sectionIndex` - The pallet index from `createSectionOptions`

**Returns:** Array of method options, or `null` if pallet has no calls

**Example:**
```typescript
import { createMethodOptions } from "@/lib/parser";

// Get methods for the Balances pallet (index 4)
const methods = createMethodOptions(client, 4);

// Returns array like:
// [
//   { text: "transferAllowDeath", value: 0 },
//   { text: "forceTransfer", value: 2 },
//   { text: "transferKeepAlive", value: 3 },
//   { text: "transferAll", value: 4 },
//   ...
// ]
```

**Notes:**
- Uses the client's registry to resolve the calls enum type
- The `value` is the method variant index used for call encoding
- Method names are returned as-is from metadata (typically camelCase)

### getArgType()

Get detailed type information for a specific type ID.

```typescript
function getArgType(
  client: DedotClient<PolkadotApi>,
  typeId: number
): TypeDef | { type: "Enum"; value: { members: EnumMember[] } }
```

**Parameters:**
- `client` - Connected Dedot client instance
- `typeId` - The type ID from metadata

**Returns:** Type definition details, with expanded enum members for enum types

**Example:**
```typescript
import { getArgType } from "@/lib/parser";

// Get type info for MultiAddress (type ID 113)
const typeInfo = getArgType(client, 113);

// For an enum type, returns:
// {
//   type: "Enum",
//   value: {
//     members: [
//       { name: "Id", fields: [{ typeId: 0, typeName: "AccountId" }], index: 0 },
//       { name: "Index", fields: [{ typeId: 114, typeName: "AccountIndex" }], index: 1 },
//       { name: "Raw", fields: [{ typeId: 14, typeName: "Vec<u8>" }], index: 2 },
//       ...
//     ]
//   }
// }
```

## Working with Method Fields

To get the parameters for a specific method, you need to traverse the metadata:

```typescript
function getMethodFields(client, palletIndex, methodIndex) {
  // Find the pallet
  const pallet = client.metadata.latest.pallets.find(
    p => p.index === palletIndex
  );
  if (!pallet?.calls) return [];

  // Get the calls type ID
  const callsTypeId = typeof pallet.calls === "number"
    ? pallet.calls
    : pallet.calls.typeId;

  // Get the enum type definition
  const palletCalls = client.registry.findType(callsTypeId);
  if (palletCalls.typeDef.type !== "Enum") return [];

  // Find the specific method variant
  const method = palletCalls.typeDef.value.members.find(
    m => m.index === methodIndex
  );
  if (!method) return [];

  // Return the fields (parameters)
  return method.fields.map((field, index) => ({
    name: field.name || `arg${index}`,
    typeId: field.typeId,
    typeName: field.typeName || "",
  }));
}
```

**Example usage:**
```typescript
// Get parameters for Balances::transferKeepAlive
const fields = getMethodFields(client, 4, 3);
// [
//   { name: "dest", typeId: 113, typeName: "MultiAddress" },
//   { name: "value", typeId: 6, typeName: "Compact<Balance>" }
// ]
```

## Integration Example

Complete example showing how to build a pallet/method selector:

```typescript
import { useState, useMemo } from "react";
import { createSectionOptions, createMethodOptions } from "@/lib/parser";

function ExtrinsicSelector({ client }) {
  const [selectedPallet, setSelectedPallet] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");

  // Get all pallets
  const pallets = useMemo(() => {
    if (!client?.metadata?.latest) return [];
    return createSectionOptions(client.metadata.latest) || [];
  }, [client]);

  // Get methods for selected pallet
  const methods = useMemo(() => {
    if (!client || !selectedPallet) return [];
    const palletIndex = parseInt(selectedPallet);
    return createMethodOptions(client, palletIndex) || [];
  }, [client, selectedPallet]);

  // Reset method when pallet changes
  useEffect(() => {
    setSelectedMethod("");
  }, [selectedPallet]);

  return (
    <div>
      <Select value={selectedPallet} onValueChange={setSelectedPallet}>
        {pallets.map(p => (
          <SelectItem key={p.value} value={p.value.toString()}>
            {p.text}
          </SelectItem>
        ))}
      </Select>

      {selectedPallet && (
        <Select value={selectedMethod} onValueChange={setSelectedMethod}>
          {methods.map(m => (
            <SelectItem key={m.value} value={m.value.toString()}>
              {m.text}
            </SelectItem>
          ))}
        </Select>
      )}
    </div>
  );
}
```

## Metadata Structure

Understanding the Dedot metadata structure helps when working with these APIs:

```typescript
client.metadata.latest = {
  pallets: [
    {
      index: number,           // Pallet index
      name: string,            // Pallet name (e.g., "Balances")
      calls: number | { typeId: number },  // Calls type ID
      docs: string[],          // Documentation
      // ... other fields
    },
    // ...
  ],
  types: [...],  // Type registry
};

// Types are stored in the registry
client.registry.findType(typeId) = {
  path: string[],              // Type path (e.g., ["sp_runtime", "MultiAddress"])
  params: TypeParam[],         // Generic parameters
  typeDef: TypeDef,            // The type definition
  docs: string[],              // Type documentation
};
```
