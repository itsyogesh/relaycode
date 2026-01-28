# Ecosystem Comparison & Reference

## Overview

This document compiles ecosystem research for Relaycode's positioning, including comparisons with similar projects, library choices, and reference implementations.

---

## Polkadot Frontend Library Landscape (2025)

### Core Libraries

| Library | Focus | Status | Use Case |
|---------|-------|--------|----------|
| **polkadot-js/api** | Full API client | Legacy, maintained | Existing apps, full control |
| **PAPI** | Light client, types | Active, growing | New apps, light clients |
| **Dedot** | SCALE codec, TypeScript | Active | Type-safe encoding, Relaycode |
| **Subxt** | Rust client | Active | Rust applications |

### Wallet Libraries

| Library | Description | Supported Wallets |
|---------|-------------|-------------------|
| **LunoKit** | React wallet connector | PJS, Talisman, SubWallet, Nova, WalletConnect |
| **reactive-dot** | PAPI-focused hooks | Works with multiple connectors |
| **typink** | Dedot + contracts | LunoKit compatible |
| **@polkadot/extension-dapp** | Legacy connector | Polkadot.js only |

### UI Libraries

| Library | Focus | Tech Stack |
|---------|-------|------------|
| **Polkadot UI (UX Bounty)** | General dApp components | shadcn/ui, Radix, PAPI/Dedot |
| **polkadot-js/ui** | Legacy UI components | Custom CSS |
| **Relaycode** | Extrinsic-specific inputs | shadcn/ui, Radix, Dedot |

---

## Detailed Comparisons

### polkadot-js/apps vs Relaycode

**polkadot-js/apps** is the reference implementation for Polkadot interfaces.

| Aspect | polkadot-js/apps | Relaycode |
|--------|------------------|-----------|
| **Purpose** | Full-featured explorer + tools | Focused extrinsic builder |
| **Library** | polkadot-js/api | Dedot |
| **UI Framework** | Custom React + SUI | Next.js + shadcn/ui |
| **Input Components** | 41 (react-params) | 3 now, 15+ target |
| **Bi-directional Edit** | No | Yes (unique feature) |
| **Learning Curve** | Steep | Gentle |
| **Bundle Size** | Large (~2MB) | Small (<500KB target) |
| **Maintenance** | Parity Technologies | Community |

**What to learn from polkadot-js:**
- Complete type coverage (41 input types)
- Mature error handling
- Edge case handling

**Reference files:**
- [react-params/src/Param/](https://github.com/polkadot-js/apps/tree/master/packages/react-params/src/Param)
- [findComponent.ts](https://github.com/polkadot-js/apps/blob/master/packages/react-params/src/Param/findComponent.ts)

---

### Polkadot UI (UX Bounty) vs Relaycode

**Polkadot UI** is a UX Bounty initiative to create reusable components.

| Aspect | Polkadot UI | Relaycode |
|--------|-------------|-----------|
| **Focus** | General dApp components | Extrinsic building |
| **Components** | 11 high-level | 15+ type-specific |
| **Installation** | CLI (`pnpm dlx polkadot-ui add`) | Integrated / extractable |
| **Library Support** | PAPI + Dedot | Dedot (PAPI future) |
| **Unique Feature** | Chain selector, TxButton | Bi-directional editing |

**Polkadot UI Components (as of Aug 2025):**
1. `<TxButton />` - Transaction submission
2. `<AddressInput />` - Address input
3. `<AccountInfo />` - Account display
4. `<WalletConnect />` - Wallet modal
5. `<Balance />` - Balance display
6. `<ChainSelector />` - Multi-chain picker

**What to learn from Polkadot UI:**
- CLI installation pattern
- Dual PAPI/Dedot support
- Clean component APIs

**Differentiation strategy:**
- Focus on extrinsic-specific types (Enum, Vec, Struct, Call)
- Bi-directional editing (form ↔ hex)
- Educational/developer focus

---

### PAPI vs Dedot

Both are modern alternatives to polkadot-js/api.

| Aspect | PAPI | Dedot |
|--------|------|-------|
| **Full Name** | Polkadot API | Dedot |
| **GitHub** | [polkadot-api/polkadot-api](https://github.com/polkadot-api/polkadot-api) | [dedotdev/dedot](https://github.com/dedotdev/dedot) |
| **Philosophy** | Light client first | SCALE codec first |
| **Type Generation** | Build-time codegen | Runtime introspection |
| **Bundle Size** | Smaller (tree-shaking) | Small |
| **Light Client** | First-class (smoldot) | Basic support |
| **SCALE Codec** | Generated types | First-class TypeScript |
| **Adoption** | Growing rapidly | Stable community |

**Why Dedot for Relaycode:**
1. **Runtime type introspection** - Essential for dynamic form generation
2. **First-class SCALE codec** - Critical for bi-directional editing
3. **Simpler mental model** - No codegen step
4. **Already integrated** - M1 uses Dedot

**Future consideration:**
- Add PAPI support via adapter layer
- Use `reactive-dot` for PAPI hooks if needed

---

## Input Component Reference (polkadot-js)

Complete list from `packages/react-params/src/Param/`:

### Account Types
| Component | Types Handled | Priority |
|-----------|---------------|----------|
| Account.tsx | AccountId | P0 |
| BasicAccountId32.tsx | AccountId32 | P0 |
| BasicAccountId20.tsx | AccountId20 (ETH) | P1 |
| BasicAccountIdBase.tsx | Base class | - |

### Numeric Types
| Component | Types Handled | Priority |
|-----------|---------------|----------|
| Amount.tsx | u8-u256, i8-i128 | P0 |
| Balance.tsx | Balance, BalanceOf | P0 |
| Moment.tsx | Moment, Timestamp | P2 |

### Hash Types
| Component | Types Handled | Priority |
|-----------|---------------|----------|
| Hash256.tsx | H256, Hash | P1 |
| Hash160.tsx | H160 (ETH) | P2 |
| Hash512.tsx | H512 | P3 |

### Complex Types
| Component | Types Handled | Priority |
|-----------|---------------|----------|
| Enum.tsx | Enum<...> | P0 |
| Option.tsx | Option<T> | P0 |
| Vector.tsx | Vec<T> | P0 |
| VectorFixed.tsx | [T; N] | P1 |
| Struct.tsx | Struct types | P1 |
| Tuple.tsx | (T1, T2, ...) | P1 |
| BTreeMap.tsx | BTreeMap<K, V> | P3 |

### Call Types
| Component | Types Handled | Priority |
|-----------|---------------|----------|
| Call.tsx | RuntimeCall | P2 |
| OpaqueCall.tsx | OpaqueCall | P3 |

### Governance
| Component | Types Handled | Priority |
|-----------|---------------|----------|
| Vote.tsx | Vote | P3 |
| VoteThreshold.tsx | VoteThreshold | P3 |

### Special Types
| Component | Types Handled | Priority |
|-----------|---------------|----------|
| Bool.tsx | bool | Done |
| Text.tsx | Text, String | Done |
| Bytes.tsx | Bytes, Vec<u8> | P2 |
| Code.tsx | Code (Wasm) | P3 |
| Cid.tsx | CID (IPFS) | P3 |
| File.tsx | File upload | P3 |
| KeyValue.tsx | (Key, Value) | P3 |
| Raw.tsx | Raw bytes | P3 |

### Utility
| Component | Purpose |
|-----------|---------|
| Base.tsx | Base component |
| Bare.tsx | Minimal wrapper |
| Static.tsx | Read-only display |
| Unknown.tsx | Fallback |
| Null.tsx | Null type |
| DispatchError.tsx | Error display |
| DispatchResult.tsx | Result display |
| findComponent.ts | Type → Component mapping |
| useParamDefs.ts | Parameter definitions hook |

---

## External Resources

### Documentation
- [Polkadot Wiki - Extrinsics](https://wiki.polkadot.network/docs/learn-extrinsics)
- [Substrate Docs - Runtime](https://docs.substrate.io/reference/frame-pallets/)
- [SCALE Codec Spec](https://docs.substrate.io/reference/scale-codec/)
- [Dedot Documentation](https://dedot.dev/)
- [LunoKit Documentation](https://docs.lunolab.xyz/)

### GitHub Repositories
- [polkadot-js/apps](https://github.com/polkadot-js/apps) - Reference implementation
- [polkadot-api/polkadot-api](https://github.com/polkadot-api/polkadot-api) - PAPI
- [dedotdev/dedot](https://github.com/dedotdev/dedot) - Dedot
- [Luno-lab/LunoKit](https://github.com/Luno-lab/LunoKit) - Wallet connector
- [Polkadot-UI-Initiative/polkadot-ui](https://github.com/polkadot-ui-initiative/library) - UX Bounty

### Forum Discussions
- [UX Bounty - Unified UI Component Library](https://forum.polkadot.network/t/ux-bounty-request-for-feedback-a-unified-ui-component-library/13082)
- [Reactive-DOT Announcement](https://forum.polkadot.network/t/reactive-dot-a-reactive-library-for-building-substrate-front-ends/8655)
- [LunoKit Launch](https://forum.polkadot.network/t/launch-lunokit-possibly-the-best-way-to-connect-polkadot-wallets/14470)
- [Introducing Dedot](https://forum.polkadot.network/t/introducing-dedot-a-delightful-javascript-client-for-polkadot-substrate-based-blockchains/8956)

### W3F Grants
- [Grants Program](https://github.com/w3f/Grants-Program)
- [Milestone Delivery](https://github.com/w3f/Grant-Milestone-Delivery)
- [Delivery Process](https://grants.web3.foundation/docs/Process/milestone_delivery)

---

## Relaycode Unique Value Proposition

Based on ecosystem analysis:

| Feature | polkadot-js | Polkadot UI | Relaycode |
|---------|-------------|-------------|-----------|
| Bi-directional editing | - | - | Yes |
| SCALE visualization | - | - | Yes |
| Type-level inputs | Yes (41) | Basic | Growing |
| Educational focus | - | - | Yes |
| Extractable components | - | CLI | Planned |
| Dedot-native | - | Partial | Full |

**Core differentiators:**
1. **Bi-directional editing** - Edit form OR hex, stay in sync
2. **Educational approach** - Learn what extrinsics are
3. **Dedot-native** - Deep integration with Dedot type system
4. **Focused scope** - Extrinsics only, done well

---

## Technology Recommendations

### Keep (Already Using)
- Next.js 14 (App Router)
- Dedot for chain interaction
- shadcn/ui + Radix for components
- React Hook Form + Zod
- TailwindCSS

### Add (For M2)
- LunoKit for wallet connection
- TanStack Query for data fetching
- Playwright for E2E testing (stretch)

### Consider (Post-M2)
- PAPI adapter for broader compatibility
- Storybook for component documentation
- Monorepo structure for package extraction
- Turborepo for build optimization

### Avoid
- polkadot-js/api (legacy, large bundle)
- Custom wallet integration (use LunoKit)
- Building everything from scratch (learn from existing)

---

## Related Documents

- [01-overview.md](./01-overview.md) - Implementation plan
- [02-architecture.md](./02-architecture.md) - Technical architecture
- [04-wallet-integration.md](./04-wallet-integration.md) - LunoKit details
