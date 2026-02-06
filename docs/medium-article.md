# Introducing Relaycode: The Human-Friendly Extrinsics Builder for Polkadot

*Building and submitting Substrate extrinsics shouldn't require a PhD in SCALE encoding. Relaycode makes it accessible to everyone.*

---

## The Problem: Extrinsics Are Hard

If you've ever tried to interact with a Substrate blockchain programmatically, you know the struggle. Want to transfer some tokens? You need to understand pallet indices, method variants, SCALE encoding, compact integers, and the right byte order for your arguments. Even seasoned developers find themselves squinting at hex dumps, trying to figure out why their transaction failed.

Existing tools often present a wall of technical complexity. You're either writing code against low-level APIs, or navigating interfaces that assume you already know exactly what you're doing. For newcomers to the Polkadot ecosystem—or even experienced developers exploring unfamiliar pallets—the learning curve is steep.

This barrier isn't just inconvenient; it's a bottleneck for ecosystem growth. When building and submitting extrinsics requires deep protocol knowledge, we limit who can build on Polkadot.

## Meet Relaycode: Build, Encode, Submit

Relaycode is a modern extrinsic builder designed to transform how developers and users interact with the Polkadot ecosystem. Funded by a Web3 Foundation grant, our mission is simple: make extrinsics accessible.

**What is Relaycode?**

Relaycode is a web application that lets you:
- **Build any extrinsic** using friendly form inputs
- **See real-time encoding** as you fill in parameters
- **Submit transactions** directly from your browser
- **Decode existing call data** for inspection and modification

Whether you're a developer testing a new pallet, a validator managing nominations, or a user making your first token transfer, Relaycode meets you where you are.

## Key Features

### Dual-Pane Interface with Live Preview

Relaycode's signature feature is its split-view design. On the left, you build your extrinsic using human-readable form inputs. On the right, you see the resulting SCALE-encoded hex in real time.

This isn't just convenient—it's educational. As you change values, you can watch how the encoding changes. Want to understand how addresses are encoded? Change the destination and see which bytes update. Curious about Compact encoding? Watch the hex shrink and grow as you adjust balance values.

### Bi-Directional Editing

Here's where Relaycode really shines: editing works both ways. Fill in a form, get the hex. But you can also paste hex and watch the form populate automatically.

This makes Relaycode invaluable for debugging. Have a failed transaction's call data? Paste it in, see what was actually submitted, fix the error, and resubmit. No more guessing games with hex dumps.

### Full Pallet and Method Coverage

Relaycode reads your chain's metadata directly. Every pallet, every method, every parameter type—it's all available. No hardcoded lists that go stale. Connect to any Substrate chain, and you'll see its complete extrinsic catalog.

The system dynamically resolves complex types. Nested structs, variable-length vectors, optional values, enum variants—Relaycode generates appropriate inputs for each type automatically.

### Smart Type-Aware Inputs

Not all inputs are created equal. An account address needs different handling than a boolean flag or a balance amount. Relaycode provides specialized input components for each type:

- **Account Input**: Dropdown with connected wallet accounts, recent address history, and SS58 validation
- **Balance Input**: Human-readable amounts (1.5 DOT instead of 15000000000 planck) with denomination switching
- **Vector Input**: Dynamic add/remove for array parameters
- **Call Input**: Full nested extrinsic builder for batch operations and sudo calls
- **Option Input**: Toggle to enable/disable optional parameters

Each input understands its type's constraints and provides appropriate validation.

### Wallet Integration

Relaycode integrates with Polkadot wallet extensions (Polkadot.js, Talisman, SubWallet, and more). Connect your wallet, select an account, and submit transactions without leaving the interface.

Your available balance appears alongside balance inputs, with a "Max" button that calculates the maximum transferable amount (accounting for existential deposit). No more mental math or failed transactions due to insufficient funds.

## Technical Architecture

### Why Dedot, Not polkadot-js?

Relaycode is built on [Dedot](https://github.com/dedotdev/dedot), a modern TypeScript library for Polkadot development. While polkadot-js has served the ecosystem well, Dedot offers significant advantages:

- **Type safety**: Full TypeScript generics for chain-specific types
- **Smaller bundles**: Modular architecture reduces client-side payload
- **Modern APIs**: Cleaner interfaces designed for today's development patterns
- **Active development**: Rapidly evolving with the ecosystem

### SCALE Codec Handling

At its core, Relaycode is a sophisticated SCALE encoder/decoder. The codec layer:

1. Reads type definitions from chain metadata
2. Coerces form values (strings) to appropriate JavaScript types
3. Encodes using Dedot's type-safe codec registry
4. Handles the reverse for decoding

This architecture means Relaycode works with any valid Substrate type—no special handling required for new pallets or custom types.

### Dynamic Component Resolution

The input system uses a priority-based type resolution algorithm:

```
findComponent("AccountId") → Account input
findComponent("Vec<Balance>") → Vector of Balance inputs
findComponent("Option<H256>") → Optional Hash input
```

When Relaycode encounters a type, it finds the most specific matching component. Generic types recurse, building complex nested input structures automatically.

## Getting Started

Using Relaycode is straightforward:

1. **Visit Relaycode** in your browser
2. **Connect your wallet** using the button in the header
3. **Select a pallet** (like Balances) from the dropdown
4. **Select a method** (like transferKeepAlive)
5. **Fill in the parameters** using the form inputs
6. **Review the encoded call** in the right pane
7. **Click Submit** to sign and send

For your first transaction, try a simple remark (`System.remark`) with some text. It's a free extrinsic that won't transfer any funds—perfect for testing.

### Multi-Chain Support

Relaycode supports multiple chains out of the box. Use the chain selector dropdown in the navbar to switch between **Polkadot**, **Kusama**, and **Westend** (testnet). The builder automatically reconnects, loads the chain's metadata, and adjusts denominations and SS58 prefixes.

### Type Badges

Each parameter field in the builder now shows its Substrate type name (e.g., `MultiAddress`, `Compact<Balance>`) as a badge next to the field label, helping developers understand the underlying types.

### Comprehensive Type Coverage

Beyond the standard types, Relaycode now supports:
- **BTreeMap<K, V>** - Key-value pair maps with typed inputs
- **BTreeSet<T>** - Unique value sets with duplicate detection
- **[T; N]** - Fixed-length arrays
- **H160, H256, H512** - All hash sizes with correct length validation

## What's Next

Relaycode is actively developed, with exciting features on the roadmap:

**Extrinsic Templates**: Save frequently-used extrinsics as templates. Share them with your team or the community.

**Batch Builder**: Visual interface for constructing complex batch transactions with drag-and-drop ordering.

**Historical Analysis**: Decode and analyze historical extrinsics from block explorers.

**Parachain Support**: Expand beyond relay chains to support Asset Hub, People, Coretime, and custom parachains.

We're building the tools we wish we had when we started developing on Polkadot. If you have ideas for features that would help your workflow, we'd love to hear them.

## Credits and Acknowledgments

Relaycode is made possible by:

- **Web3 Foundation** for grant funding through the [W3F Grants Program](https://github.com/w3f/Grants-Program)
- **Dedot** team for their excellent Polkadot client library
- **The Polkadot community** for feedback and testing

The project is open source. Check out the code, report issues, or contribute at our GitHub repository.

---

*Relaycode: Because building on Polkadot should be about your ideas, not fighting with bytes.*

**Links:**
- [Try Relaycode](#) (deployment URL)
- [GitHub Repository](#) (repo URL)
- [Documentation](./README.md)
- [W3F Grant Application](#) (grant URL)
