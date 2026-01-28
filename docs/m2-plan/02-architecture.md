# Architecture & Component Design

## Design Philosophy

Relaycode follows a **decoupled, extractable architecture** where components can be:
1. Used within the Extrinsic Builder application
2. Extracted as standalone npm packages for other dApps
3. Customized and themed independently

This aligns with the landing page vision of providing reusable Substrate utilities.

---

## Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LAYER 3: APPLICATIONS                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Extrinsic       │  │ SCALE Codec     │  │ Address Converter       │  │
│  │ Builder         │  │ Playground      │  │ (Future)                │  │
│  │ /app/builder    │  │ (Future)        │  │                         │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
│           │                    │                        │               │
├───────────┴────────────────────┴────────────────────────┴───────────────┤
│                        LAYER 2: COMPONENTS                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    @relaycode/inputs (Future Package)             │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │   │
│  │  │ <Account   │ │ <Balance   │ │ <Enum      │ │ <Vector    │     │   │
│  │  │  Input />  │ │  Input />  │ │  Input />  │ │  Input />  │     │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │   │
│  │  │ <Struct    │ │ <Option    │ │ <Tuple     │ │ <Call      │     │   │
│  │  │  Input />  │ │  Input />  │ │  Input />  │ │  Input />  │     │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    @relaycode/wallet (Future Package)             │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                    │   │
│  │  │ <Connect   │ │ <Account   │ │ <Sign      │                    │   │
│  │  │  Button /> │ │  Display />│ │  Modal />  │                    │   │
│  │  └────────────┘ └────────────┘ └────────────┘                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                        LAYER 1: INFRASTRUCTURE                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐   │
│  │    Dedot      │  │   LunoKit     │  │   React Hook Form + Zod   │   │
│  │  (Chain API)  │  │  (Wallets)    │  │   (Forms & Validation)    │   │
│  └───────────────┘  └───────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Input Component Architecture

### Base Interface

All input components implement a common interface for consistency:

```typescript
// components/params/types.ts

import { Control, FieldValues, Path } from "react-hook-form";
import { ZodSchema } from "zod";

/**
 * Base props shared by all param input components
 */
export interface BaseParamProps<T extends FieldValues = FieldValues> {
  /** React Hook Form control object */
  control: Control<T>;

  /** Field name/path in the form */
  name: Path<T>;

  /** Human-readable label */
  label?: string;

  /** Help text / description */
  description?: string;

  /** Whether the field is required */
  required?: boolean;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Extended props for type-aware components
 */
export interface TypeAwareParamProps<T extends FieldValues = FieldValues>
  extends BaseParamProps<T> {
  /** Dedot type definition for complex type handling */
  typeDef?: TypeDef;

  /** Chain metadata for chain-specific formatting */
  chainMeta?: ChainMeta;
}

/**
 * Component registration for dynamic rendering
 */
export interface ComponentRegistration {
  /** Component to render */
  component: React.ComponentType<BaseParamProps>;

  /** Zod schema for validation */
  schema: ZodSchema;

  /** Type patterns this component handles */
  patterns: string[];

  /** Priority (higher = more specific) */
  priority: number;
}
```

### Type Resolution System

```typescript
// lib/input-map.ts

import { ComponentRegistration } from "@/components/params/types";

/**
 * Registry of input components mapped to Substrate types
 *
 * Resolution order:
 * 1. Exact type name match
 * 2. Pattern match (regex)
 * 3. Category match (number, hash, etc.)
 * 4. Fallback to Text
 */
export const componentRegistry: ComponentRegistration[] = [
  // Account types - highest priority for address handling
  {
    component: AccountInput,
    schema: accountSchema,
    patterns: [
      "AccountId",
      "AccountId32",
      "AccountId20",
      "MultiAddress",
      "Address",
      "LookupSource",
    ],
    priority: 100,
  },

  // Balance types
  {
    component: BalanceInput,
    schema: balanceSchema,
    patterns: [
      "Balance",
      "BalanceOf",
      "Compact<Balance>",
    ],
    priority: 90,
  },

  // Numeric types
  {
    component: AmountInput,
    schema: amountSchema,
    patterns: [
      "^u\\d+$",      // u8, u16, u32, u64, u128, u256
      "^i\\d+$",      // i8, i16, i32, i64, i128
      "Compact<u",    // Compact<u32>, etc.
      "BlockNumber",
      "Index",
      "Nonce",
    ],
    priority: 80,
  },

  // Hash types
  {
    component: HashInput,
    schema: hashSchema,
    patterns: [
      "H256",
      "H160",
      "H512",
      "Hash",
      "BlockHash",
      "ExtrinsicHash",
    ],
    priority: 80,
  },

  // Boolean
  {
    component: BooleanInput,
    schema: booleanSchema,
    patterns: ["bool", "Bool"],
    priority: 70,
  },

  // Complex types - lower priority, resolved after specifics
  {
    component: EnumInput,
    schema: enumSchema,
    patterns: ["Enum<"],
    priority: 60,
  },

  {
    component: OptionInput,
    schema: optionSchema,
    patterns: ["Option<"],
    priority: 60,
  },

  {
    component: VectorInput,
    schema: vectorSchema,
    patterns: ["Vec<", "BoundedVec<"],
    priority: 50,
  },

  {
    component: StructInput,
    schema: structSchema,
    patterns: ["Struct"],
    priority: 40,
  },

  {
    component: TupleInput,
    schema: tupleSchema,
    patterns: ["^\\(.*\\)$"],  // Tuple pattern
    priority: 40,
  },

  // Call type for nested extrinsics
  {
    component: CallInput,
    schema: callSchema,
    patterns: ["Call", "RuntimeCall", "Box<Call>"],
    priority: 30,
  },

  // Fallback - lowest priority
  {
    component: TextInput,
    schema: textSchema,
    patterns: [".*"],  // Matches anything
    priority: 0,
  },
];

/**
 * Find the appropriate component for a given type
 */
export function findComponent(typeName: string): ComponentRegistration {
  // Sort by priority descending
  const sorted = [...componentRegistry].sort((a, b) => b.priority - a.priority);

  for (const reg of sorted) {
    for (const pattern of reg.patterns) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(typeName)) {
        return reg;
      }
    }
  }

  // Should never reach here due to fallback, but TypeScript needs this
  return componentRegistry[componentRegistry.length - 1];
}
```

---

## State Management Architecture

### Context Hierarchy

```
App
├── ThemeProvider (next-themes)
│   └── QueryClientProvider (TanStack Query)
│       └── LunoKitProvider (Wallet connection)
│           └── ChainProvider (Dedot client)
│               └── ExtrinsicBuilderProvider (Form state)
│                   └── Pages & Components
```

### Chain Context

```typescript
// context/chain-context.tsx

interface ChainContextValue {
  /** Current chain ID */
  chainId: string;

  /** Dedot client instance */
  client: DedotClient | null;

  /** Chain metadata */
  metadata: Metadata | null;

  /** Available pallets */
  pallets: PalletInfo[];

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Switch to a different chain */
  switchChain: (chainId: string) => Promise<void>;

  /** Refresh metadata */
  refreshMetadata: () => Promise<void>;
}
```

### Wallet Context

```typescript
// context/wallet-context.tsx

interface WalletContextValue {
  /** Connected accounts */
  accounts: Account[];

  /** Currently selected account */
  selectedAccount: Account | null;

  /** Connection status */
  isConnected: boolean;

  /** Connecting state */
  isConnecting: boolean;

  /** Connect wallet */
  connect: () => Promise<void>;

  /** Disconnect wallet */
  disconnect: () => void;

  /** Select an account */
  selectAccount: (address: string) => void;

  /** Sign a payload */
  sign: (payload: SignerPayload) => Promise<SignedPayload>;
}
```

---

## Data Flow: Build to Submit

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTRINSIC BUILDING FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

1. USER SELECTS PALLET & METHOD
   ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
   │ Pallet      │────▶│ Method      │────▶│ Load Method         │
   │ Dropdown    │     │ Dropdown    │     │ Metadata & Fields   │
   └─────────────┘     └─────────────┘     └─────────────────────┘
                                                      │
                                                      ▼
2. DYNAMIC FORM GENERATION
   ┌─────────────────────────────────────────────────────────────┐
   │ For each field in method.meta.fields:                       │
   │   1. Get field type from metadata                           │
   │   2. findComponent(fieldType) → Get input component         │
   │   3. Generate Zod schema for validation                     │
   │   4. Render component with React Hook Form                  │
   └─────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
3. USER FILLS FORM
   ┌─────────────────────────────────────────────────────────────┐
   │ Form State (React Hook Form)                                │
   │ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
   │ │ Field 1: ...  │  │ Field 2: ...  │  │ Field N: ...  │    │
   │ └───────────────┘  └───────────────┘  └───────────────┘    │
   │                           │                                 │
   │                           ▼                                 │
   │                    Zod Validation                           │
   └─────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
4. REAL-TIME ENCODING (Bi-directional)
   ┌─────────────────────────────────────────────────────────────┐
   │                                                              │
   │  Form Values ◀──────────────────────────▶ Encoded Hex       │
   │                                                              │
   │  ┌──────────────┐        Dedot         ┌──────────────┐    │
   │  │ { dest: ..., │  ◀═══ SCALE ═══▶    │ 0x0403...    │    │
   │  │   value: ... │       Codec          │              │    │
   │  │ }            │                       │              │    │
   │  └──────────────┘                       └──────────────┘    │
   │                                                              │
   └─────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
5. SIGN & SUBMIT (New in M2)
   ┌─────────────────────────────────────────────────────────────┐
   │                                                              │
   │  ┌────────────┐    ┌────────────┐    ┌────────────────┐    │
   │  │ Submit     │───▶│ LunoKit    │───▶│ Wallet         │    │
   │  │ Button     │    │ Sign Modal │    │ Extension      │    │
   │  └────────────┘    └────────────┘    └────────────────┘    │
   │                                              │              │
   │                                              ▼              │
   │                                       ┌────────────┐       │
   │                                       │ Submit TX  │       │
   │                                       │ to Chain   │       │
   │                                       └────────────┘       │
   │                                              │              │
   │                                              ▼              │
   │                                       ┌────────────┐       │
   │                                       │ TX Result  │       │
   │                                       │ Display    │       │
   │                                       └────────────┘       │
   │                                                              │
   └─────────────────────────────────────────────────────────────┘
```

---

## Component Decoupling Strategy

### For M2 (Now)
Keep components in the main app but design with extraction in mind:
- Minimal dependencies per component
- Clear prop interfaces
- No direct context access (pass via props or hooks)
- Barrel exports for clean imports

### For Future (Post-M2)
Extract to packages:
```
packages/
├── @relaycode/inputs/
│   ├── package.json
│   ├── src/
│   │   ├── AccountInput.tsx
│   │   ├── BalanceInput.tsx
│   │   └── ...
│   └── index.ts
├── @relaycode/wallet/
└── @relaycode/codec-ui/
```

### Extraction Checklist Per Component
- [ ] No imports from `@/app/*`
- [ ] No direct context consumption (use hooks)
- [ ] Props-driven configuration
- [ ] Peer dependencies for React, Dedot, etc.
- [ ] Standalone Storybook story
- [ ] Unit tests included

---

## File Naming Conventions

```
components/
├── params/
│   ├── inputs/
│   │   ├── account.tsx          # kebab-case for files
│   │   └── index.ts             # Barrel export
│   └── types.ts                 # Shared types
├── builder/
│   ├── extrinsic-builder.tsx    # kebab-case
│   └── information-pane.tsx
└── wallet/
    ├── wallet-provider.tsx
    └── connect-button.tsx

hooks/
├── use-wallet.ts                # use-* prefix
├── use-chain.ts
└── use-input-component.ts

lib/
├── input-map.ts                 # kebab-case
├── type-utils.ts
└── format.ts

context/
├── chain-context.tsx            # *-context suffix
└── wallet-context.tsx
```

---

## Related Documents

- [01-overview.md](./01-overview.md) - Implementation timeline
- [03-input-components.md](./03-input-components.md) - Detailed component specs
- [04-wallet-integration.md](./04-wallet-integration.md) - LunoKit setup
