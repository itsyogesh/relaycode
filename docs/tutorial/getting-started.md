# Getting Started with Relaycode

Welcome to Relaycode! This tutorial will guide you through building and submitting your first extrinsic on Polkadot.

## What is Relaycode?

Relaycode is an extrinsic builder for the Polkadot ecosystem. It provides a user-friendly interface for:

- **Building extrinsics** - Construct any pallet call using human-readable forms
- **Encoding/Decoding** - Convert between form values and SCALE-encoded hex
- **Wallet integration** - Connect your wallet to sign and submit transactions
- **Bi-directional editing** - Edit via form or raw hex, with real-time sync

## Prerequisites

- A Polkadot-compatible wallet (Polkadot.js extension, Talisman, SubWallet, etc.)
- Some DOT or testnet tokens for transaction fees

## Connecting Your Wallet

1. **Open Relaycode** and navigate to the Builder page
2. **Click "Connect Wallet"** in the top navigation
3. **Select your wallet** from the available options
4. **Approve the connection** in your wallet extension
5. Your connected accounts will appear in the Account selector

Once connected, you'll see your account balance and be able to select accounts for transactions.

## Understanding the Interface

Relaycode uses a dual-pane interface:

```
┌─────────────────────────────────┬─────────────────────────────────┐
│                                 │                                 │
│         FORM PANE               │         HEX PANE                │
│                                 │                                 │
│  Human-readable inputs          │  SCALE-encoded call data        │
│  - Pallet selector              │  - Live hex preview             │
│  - Method selector              │  - Editable hex input           │
│  - Parameter inputs             │  - Auto-decode on edit          │
│                                 │                                 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**Left Pane (Form):** Select pallets, methods, and fill in parameters using friendly input components.

**Right Pane (Hex):** See the resulting encoded call data in real-time. You can also paste hex to decode and edit.

## Building Your First Extrinsic

Let's create a simple balance transfer:

### Step 1: Select Pallet and Method

1. In the **Pallet** dropdown, search for and select **"Balances"**
2. In the **Method** dropdown, select **"transferKeepAlive"**

The form will update to show the required parameters.

### Step 2: Fill in Parameters

The transfer requires two parameters:

**dest (Destination)**
- Click the destination field
- Select an account from your connected accounts, or
- Paste an SS58 address, or
- Select from recent addresses

**value (Amount)**
- Enter the amount to transfer
- Use the denomination selector (DOT, mDOT, planck)
- Your available balance is shown below the input
- Click "Max" to fill your maximum transferable amount

### Step 3: Review the Encoded Call

As you fill in the form, the right pane updates with the encoded call data:

```
0x0503d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d0700e8764817
```

This hex represents your complete extrinsic call:
- `05` - Balances pallet index
- `03` - transferKeepAlive method index
- Remaining bytes - Encoded destination and amount

### Step 4: Submit the Transaction

1. Review your transaction details
2. Click **"Submit"**
3. Your wallet will prompt you to sign
4. Approve the transaction in your wallet
5. Wait for confirmation

You'll see a success message with the transaction hash once it's included in a block.

## Input Types Explained

Relaycode provides specialized inputs for different Substrate types:

### Account Input
For addresses and account IDs:
- Dropdown with connected accounts
- Recent address history
- Paste any valid SS58 address
- Automatic format validation

### Balance Input
For token amounts:
- Human-readable input (e.g., "1.5")
- Denomination selector (DOT/mDOT/planck)
- Automatic conversion to planck
- Available balance display
- Existential deposit warning

### Amount Input
For plain integers (u32, u64, u128):
- Simple numeric input
- Supports large numbers (BigInt)

### Boolean Input
For true/false values:
- Toggle switch

### Hash Input
For block hashes, extrinsic hashes (H256):
- 32-byte hex input
- Format validation

### Vector Input
For arrays (Vec<T>):
- Add/remove items
- Dynamic length

### Option Input
For optional values (Option<T>):
- Toggle to enable/disable
- Inner input when enabled

## Common Extrinsics

Here are some common extrinsics you can build:

### Balance Transfer
**Pallet:** Balances
**Method:** transferKeepAlive
**Parameters:**
- dest: Destination address
- value: Amount in planck

### Remark
**Pallet:** System
**Method:** remark
**Parameters:**
- remark: Bytes data (hex)

### Set Identity
**Pallet:** Identity
**Method:** setIdentity
**Parameters:**
- info: Identity info struct

### Batch Calls
**Pallet:** Utility
**Method:** batch
**Parameters:**
- calls: Array of nested calls

## Troubleshooting

### "Invalid address" error
- Ensure the address uses valid Base58 characters
- Check the address length (typically 47-48 characters)
- Verify it's a valid SS58 address for the target chain

### "Insufficient balance" error
- Account needs funds for transfer + fees
- Remember the existential deposit (1 DOT on Polkadot)

### Transaction not submitting
- Check wallet is connected
- Ensure you have enough balance for fees
- Check network connectivity

### Form not updating from hex
- Ensure hex is valid (starts with 0x)
- Hex must match the selected pallet/method
- Check for encoding errors in the hex

## Next Steps

Now that you've completed your first transaction, explore:

- [Advanced Usage](./advanced.md) - Bi-directional editing, batch calls, complex types
- [API Reference](../api/README.md) - Use Relaycode programmatically
- [Component Reference](../components/README.md) - Understand input components
