# Relaycode: Rethinking Extrinsics in Polkadot


## Project Overview
Relaycode is an intuitive extrinsics builder designed to transform the way developers and users interact with extrinsics in the Polkadot ecosystem. By bridging the gap between complex pallet operations and user-friendly interfaces, Relaycode gives both regular users and developers the ability to harness the full potential of extrinsics the Polkadot ecosystem.

### Key Features:

1. **A New Extrinsic Builder**: Our state-of-the-art builder allows users to construct extrinsics with ease, providing real-time encoding and decoding for immediate visual feedback.

2. **Dual-Pane Interface**: Relaycode lets you see the best of both worlds with our split-view design. Build extrinsics using human-readable inputs on one side, while simultaneously viewing the corresponding encoded data on the other.

3. **Bi-Directional Editing**: Seamlessly switch between editing human-readable values and raw encoded data. Changes in one pane are instantly reflected in the other, offering unparalleled flexibility.

4. **Wallet Integration**: Connect your Polkadot wallet directly within Relaycode to sign and submit extrinsics, eliminating the need for external tools or interfaces.

5. **Customizable Snippets**: Create, save, and share reusable extrinsic templates. Streamline complex processes by chaining multiple calls into a single, user-friendly form.

6. **Educational Tools**: Built-in guides and tooltips help users understand the intricacies of extrinsics, making Relaycode an excellent learning platform for Polkadot users.

<img src="docs/demo.gif"/>
</div>

## Technical Architecture
- Frontend: Next.js 15 with App Router, React, TypeScript
- Styling: Tailwind CSS, shadcn/ui components
- State Management: React Hooks, Context API
- Polkadot Integration: [Dedot](https://github.com/dedotdev/dedot)
- Theming: next-themes for dark/light mode support

## Documentation

- [API Reference](docs/api/README.md) - Core encoding, decoding, and validation APIs
- [Component Reference](docs/components/README.md) - Input component documentation
- [Getting Started Tutorial](docs/tutorial/getting-started.md) - Build your first extrinsic
- [Advanced Usage](docs/tutorial/advanced.md) - Bi-directional editing, batch calls, complex types
- [Testing Guide](docs/testing-guide.md) - How to run and write tests

## Milestones

For detailed project milestones and deliverables, see our [Milestones](docs/relaycode.md) documentation.

### Implemented Input Components

The following input components have been implemented for the extrinsic builder:

- [x] **Account** - Handles `AccountId`, `Address`, `LookupSource`, `MultiAddress`
- [x] **Amount** - Handles `i8`, `i16`, `i32`, `i64`, `i128`, `u8`, `u16`, `u32`, `u64`, `u128`, `Compact<uN>`
- [x] **Balance** - Handles `Balance`, `BalanceOf`
- [x] **Bool** - Handles `bool`
- [x] **Bytes** - Handles `Bytes`, `Vec<u8>`
- [x] **Call** - Handles `Call`, `RuntimeCall`
- [x] **Enum** - Handles enum types from metadata
- [x] **Hash256** - Handles `Hash`, `H256`
- [x] **KeyValue** - Handles `KeyValue`
- [x] **Moment** - Handles `Moment`, `MomentOf`
- [x] **Option** - Handles `Option<T>`
- [x] **Text** - Handles `String`, `Text` (and fallback for unknown types)
- [x] **Struct** - Handles composite/struct types
- [x] **Tuple** - Handles tuple types `(T1, T2, ...)`
- [x] **Vector** - Handles `Vec<T>`, `BoundedVec<T, S>`
- [x] **Vote** - Handles `Vote`
- [x] **VoteThreshold** - Handles `VoteThreshold`

### Planned Components

- [ ] **Hash160** - Handles `H160`
- [ ] **Hash512** - Handles `H512`
- [ ] **BTreeMap** - Handles `BTreeMap`
- [ ] **VectorFixed** - Handles fixed-length arrays
