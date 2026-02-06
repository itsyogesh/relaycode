# Advanced Usage

This guide covers advanced features of Relaycode for power users and developers.

## Bi-Directional Editing

Relaycode supports seamless switching between form-based and hex-based editing. Changes in either pane are instantly reflected in the other.

### Form → Hex Flow

1. Fill in the form fields
2. Watch the hex pane update in real-time
3. Each field change re-encodes the entire call

```
Form Input:                         Hex Output:
┌───────────────────────────┐       ┌───────────────────────────┐
│ dest: 5GrwvaEF...utQY     │  ───► │ 0x0503d43593c715...      │
│ value: 1 DOT              │       │                          │
└───────────────────────────┘       └───────────────────────────┘
```

### Hex → Form Flow

1. Paste or edit hex in the right pane
2. The system decodes and populates the form
3. Invalid hex shows an error message

```
Hex Input:                          Form Output:
┌───────────────────────────┐       ┌───────────────────────────┐
│ 0x0503d43593c715...       │  ───► │ dest: 5GrwvaEF...utQY     │
│                           │       │ value: 1000000000000      │
└───────────────────────────┘       └───────────────────────────┘
```

### Decoding Existing Call Data

To decode an existing extrinsic:

1. Select the correct pallet and method first
2. Paste the arguments hex (not the full extrinsic)
3. The form populates with decoded values

**Note:** The hex should be just the encoded arguments, not including the pallet/method prefix.

## Batch Transactions

Use `Utility.batch` or `Utility.batchAll` to execute multiple calls in a single transaction.

### Creating a Batch

1. Select **Utility** pallet
2. Select **batch** or **batchAll** method
3. Add calls using the nested Call input

### batch vs batchAll

| Method | Behavior on Failure |
|--------|---------------------|
| `batch` | Continues executing remaining calls |
| `batchAll` | Rolls back all calls (atomic) |

### Example: Multiple Transfers

```
Utility.batchAll
└── calls
    ├── [0] Balances.transferKeepAlive
    │       dest: 5FHneW46...
    │       value: 1 DOT
    │
    └── [1] Balances.transferKeepAlive
            dest: 5DAAnrj7...
            value: 2 DOT
```

### Nested Batch Calls

Batches can contain any calls, including other batches:

```
Utility.batch
└── calls
    ├── [0] Balances.transferKeepAlive
    │
    └── [1] Utility.batch  ← Nested batch
            └── calls
                ├── [0] System.remark
                └── [1] System.remark
```

## Complex Types

### Structs

Structs group multiple named fields together. Relaycode renders each field with its appropriate input component.

```
ProposalInfo {
  title: String     → Text input
  description: String → Text input
  budget: Balance   → Balance input
  recipient: AccountId → Account input
}
```

### Tuples

Tuples are ordered collections of typed values. They appear as numbered elements:

```
(AccountId, Balance, bool)

Element 0: [Account input]
Element 1: [Balance input]
Element 2: [Boolean toggle]
```

### Enums

Enums represent a choice between variants. Some variants have associated data:

```
Origin {
  Root         → No additional input
  Signed(AccountId) → Shows Account input when selected
  None         → No additional input
}
```

**Usage:**
1. Select the variant from the dropdown
2. If the variant has data, fill in the inner input

### Nested Calls

The `Call` input allows building any extrinsic as a parameter:

```
Sudo.sudo
└── call: Call
    └── [Nested pallet/method selector]
        └── [Parameters for nested call]
```

Common uses:
- `Sudo.sudo` - Execute privileged calls
- `Utility.batch` - Batch multiple calls
- `Multisig.asMulti` - Multi-signature calls
- `Proxy.proxy` - Proxy calls

## Working with Vectors

Vector inputs allow dynamic arrays of any type.

### Adding Items

Click **"+ Add Item"** to add a new element. A new input row appears.

### Removing Items

Click the **trash icon** next to an item to remove it.

### Constraints

Some vectors have min/max constraints:

```
Recipients (min: 1, max: 10)  ← Shows constraint info
```

- Cannot remove items below minimum
- Cannot add items above maximum

### Nested Vectors

Vectors can contain any type, including other vectors:

```
Vec<Vec<AccountId>>

[0] ─┬─ [0] 5GrwvaEF...
     └─ [1] 5FHneW46...

[1] ─┬─ [0] 5DAAnrj7...
     └─ [1] 5GNJqTPy...
```

## Fixed-Length Arrays

Fixed-length arrays like `[u8; 32]` render a fixed number of input fields:

```
[u8; 32] — 32 elements
├── [0]: [u8 input]
├── [1]: [u8 input]
├── ...
└── [31]: [u8 input]
```

Unlike `Vec<T>`, you cannot add or remove elements. The count is determined by the type definition.

## BTreeMap and BTreeSet

### BTreeMap<K, V>

Key-value maps render as a list of entries, each with typed key and value inputs:

```
BTreeMap<AccountId, Balance>
├── Entry 0:  Key: [Account input]  Value: [Balance input]
├── Entry 1:  Key: [Account input]  Value: [Balance input]
└── [+ Add Entry]
```

In the SCALE metadata, BTreeMap is encoded as a `Sequence` of `Tuple`s — Relaycode resolves the key and value types automatically from the chain registry.

### BTreeSet<T>

Sets render similarly to vectors but with duplicate detection:

```
BTreeSet<AccountId>
├── Item 0: [Account input]
├── Item 1: [Account input]
└── [+ Add Item]

⚠ Set contains duplicate values  ← shown when duplicates detected
```

## Option Types

Optional values can be present or absent.

### Enabling/Disabling

Toggle the switch to enable or disable the value:

- **Enabled:** Shows the inner input, value is included
- **Disabled:** Inner input is dimmed, value is `null`/`None`

### In Encoded Output

```
Enabled:  Some(value) → 0x01[encoded_value]
Disabled: None        → 0x00
```

## Denominations and Balance Precision

### Available Denominations

For Polkadot:
| Denomination | Multiplier | Example |
|--------------|------------|---------|
| DOT | 10^10 planck | 1 DOT = 10,000,000,000 planck |
| mDOT | 10^7 planck | 1 mDOT = 10,000,000 planck |
| planck | 1 | Base unit |

### Precision Handling

- Each denomination has a maximum decimal precision
- DOT allows up to 10 decimal places
- Planck allows only whole numbers (integers)

```
Valid:   1.5 DOT     → 15000000000 planck
Valid:   0.0000000001 DOT → 1 planck
Invalid: 0.00000000001 DOT → Error (excess precision)
```

### Conversion

Switching denominations converts the displayed value:

```
1.5 DOT → 1500 mDOT → 15000000000 planck
```

The underlying planck value remains the same.

## Error Handling

### Encoding Errors

When a value can't be encoded:
- The hex pane shows the last valid encoding
- An error message appears below the field
- Submit is disabled until fixed

Common causes:
- Invalid address format
- Wrong type (e.g., text in number field)
- Missing required fields

### Decoding Errors

When hex can't be decoded:
- Form fields show last valid values
- Error message in hex pane
- Invalid hex is highlighted

Common causes:
- Incomplete hex (truncated data)
- Wrong pallet/method selected
- Malformed hex (non-hex characters)

### Validation Errors

Pre-submission validation catches:
- Missing required fields
- Invalid formats (addresses, hashes)
- Constraint violations (vector length)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next field |
| `Shift+Tab` | Move to previous field |
| `Enter` | Submit (when focused on submit button) |
| `Escape` | Close dropdowns/modals |

## Tips for Developers

### Inspecting Encoded Calls

Use the hex output to understand SCALE encoding:

```
0x0503d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d0700e8764817

05   - Pallet index (Balances = 5)
03   - Method index (transferKeepAlive = 3)
00   - MultiAddress variant (Id = 0)
d4.. - AccountId (32 bytes)
07.. - Compact<Balance> encoded value
```

### Testing Encoding

1. Build a call via form
2. Copy the hex
3. Decode in polkadot.js apps to verify
4. Or use Dedot's codec directly

### Debugging Decode Issues

If decode fails:
1. Check hex starts with `0x`
2. Verify pallet/method match the hex
3. Check byte length matches expected
4. Try decoding individual arguments

## See Also

- [API Reference](../api/README.md) - Programmatic usage
- [Component Reference](../components/README.md) - Input component details
- [Testing Guide](../testing-guide.md) - Testing extrinsic building
