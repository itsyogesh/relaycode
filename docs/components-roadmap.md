# Components Documentation Roadmap

## Current State
- 3 component doc pages (Account, Balance, Enum) as initial examples
- Static code previews (no live chain connection)
- Manual props tables

## Future Work

### Full Component Documentation
Document all remaining components:
- AmountInput, BoolInput, BytesInput, CallInput
- HashInput (H160/H256/H512), OptionInput, StructInput
- TextInput, TupleInput, VectorInput, VectorFixedInput
- BTreeMapInput, BTreeSetInput, MomentInput
- VoteInput, VoteThresholdInput, KeyValueInput
- 10 contextual selector components

### Live Component Previews
- Connect to Westend testnet for interactive demos
- Provide mock DedotClient for isolated previews
- Show real-time SCALE encoding output

### Auto-Generated Type Tables
- Use Fumadocs auto-type-table to generate props from TypeScript interfaces
- Auto-extract from ParamInputProps and component-specific props

### Interactive Utilities/Tools Pages
Build interactive tools similar to substrate-js-utilities:
- Address Converter (SS58 format conversion)
- SCALE Codec Playground (encode/decode arbitrary types)
- Metadata Explorer (browse chain metadata)
- Extrinsic Decoder (paste hex, see human-readable)

### Component Library Vision (shadcn-style)
- Installable components via CLI (npx relaycode add account-input)
- Framework-agnostic core with React adapter
- Theming and customization support
- Copy-paste code snippets in docs
