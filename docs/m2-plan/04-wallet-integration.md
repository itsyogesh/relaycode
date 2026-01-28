# Wallet Integration Guide - LunoKit

## Overview

This document details the integration of [LunoKit](https://github.com/Luno-lab/LunoKit) for wallet connectivity in Relaycode M2. LunoKit is chosen for its:
- Dedot ecosystem compatibility
- Multi-wallet support (Polkadot.js, Talisman, SubWallet, Nova, etc.)
- Modern React patterns
- TypeScript-first design

---

## Installation

```bash
# Core packages
pnpm add @luno-kit/react @luno-kit/ui @tanstack/react-query

# Peer dependencies (if not already installed)
pnpm add react react-dom
```

---

## Architecture

### Provider Hierarchy

```
_app.tsx / layout.tsx
│
└── QueryClientProvider (TanStack Query)
    │
    └── LunoKitProvider
        │   - Wallet configuration
        │   - Chain configuration
        │   - Theme configuration
        │
        └── ChainProvider (Dedot - existing)
            │
            └── App Components
                │
                ├── ConnectButton
                ├── AccountDisplay
                └── SignModal
```

---

## Setup

### 1. Create LunoKit Configuration

```typescript
// config/wallet.ts

import { getDefaultConfig } from "@luno-kit/react";
import {
  polkadotJs,
  talisman,
  subwallet,
  nova,
  walletConnect,
} from "@luno-kit/react/wallets";

export const walletConfig = getDefaultConfig({
  // App identification
  appName: "Relaycode",
  appDescription: "Extrinsics Builder for Polkadot",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://relaycode.org",
  appIcon: "/logo.png",

  // Supported wallets
  wallets: [
    polkadotJs(),
    talisman(),
    subwallet(),
    nova(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    }),
  ],

  // Supported chains
  chains: [
    {
      id: "polkadot",
      name: "Polkadot",
      rpcUrl: "wss://rpc.polkadot.io",
      ss58Format: 0,
      tokenSymbol: "DOT",
      tokenDecimals: 10,
    },
    {
      id: "kusama",
      name: "Kusama",
      rpcUrl: "wss://kusama-rpc.polkadot.io",
      ss58Format: 2,
      tokenSymbol: "KSM",
      tokenDecimals: 12,
    },
    {
      id: "pop-network-testnet",
      name: "Pop Network Testnet",
      rpcUrl: "wss://rpc1.paseo.popnetwork.xyz",
      ss58Format: 42,
      tokenSymbol: "POP",
      tokenDecimals: 10,
    },
    // Add more chains as needed
  ],

  // Default chain
  defaultChain: "polkadot",
});
```

### 2. Create Wallet Provider

```typescript
// components/wallet/wallet-provider.tsx

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LunoKitProvider } from "@luno-kit/react";
import { walletConfig } from "@/config/wallet";
import { useState } from "react";

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Create query client with SSR-safe initialization
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching for better UX
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LunoKitProvider config={walletConfig}>
        {children}
      </LunoKitProvider>
    </QueryClientProvider>
  );
}
```

### 3. Update Root Layout

```typescript
// app/layout.tsx

import { WalletProvider } from "@/components/wallet/wallet-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ChainProvider } from "@/context/chain-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WalletProvider>
            <ChainProvider>
              {children}
            </ChainProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Components

### 1. Connect Button

Replace the existing mock connect button with LunoKit's component:

```typescript
// components/wallet/connect-button.tsx

"use client";

import { ConnectButton as LunoConnectButton } from "@luno-kit/ui";
import { useAccount, useDisconnect } from "@luno-kit/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ConnectButton({
  className,
  variant = "default",
}: ConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <AccountDisplay address={address} />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <LunoConnectButton.Custom>
      {({ openModal, isConnecting }) => (
        <Button
          variant={variant}
          className={className}
          onClick={openModal}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </LunoConnectButton.Custom>
  );
}
```

### 2. Account Display

```typescript
// components/wallet/account-display.tsx

"use client";

import { useAccount, useBalance } from "@luno-kit/react";
import { formatAddress, formatBalance } from "@/lib/format";
import { Identicon } from "@/components/ui/identicon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, ExternalLink, LogOut } from "lucide-react";
import { toast } from "sonner";

interface AccountDisplayProps {
  address: string;
  showBalance?: boolean;
}

export function AccountDisplay({
  address,
  showBalance = true,
}: AccountDisplayProps) {
  const { data: balance } = useBalance({ address });

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 hover:bg-accent">
          <Identicon address={address} size={24} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{shortAddress}</span>
            {showBalance && balance && (
              <span className="text-xs text-muted-foreground">
                {formatBalance(balance.free, 10, "DOT")}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://polkadot.subscan.io/account/${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Subscan
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 3. Sign Modal

```typescript
// components/wallet/sign-modal.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSignAndSend } from "@/hooks/use-sign-tx";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface SignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  encodedCall: string;
  callInfo: {
    pallet: string;
    method: string;
    args: Record<string, unknown>;
  };
  onSuccess?: (hash: string) => void;
  onError?: (error: Error) => void;
}

type SignState = "idle" | "signing" | "submitting" | "success" | "error";

export function SignModal({
  open,
  onOpenChange,
  encodedCall,
  callInfo,
  onSuccess,
  onError,
}: SignModalProps) {
  const [state, setState] = useState<SignState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { signAndSend, estimateFee } = useSignAndSend();
  const { data: fee } = estimateFee(encodedCall);

  const handleSign = async () => {
    try {
      setState("signing");

      const result = await signAndSend(encodedCall, {
        onSigning: () => setState("signing"),
        onSubmitting: () => setState("submitting"),
      });

      setTxHash(result.hash);
      setState("success");
      onSuccess?.(result.hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setState("error");
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleClose = () => {
    setState("idle");
    setTxHash(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state === "success"
              ? "Transaction Successful"
              : state === "error"
                ? "Transaction Failed"
                : "Sign Transaction"}
          </DialogTitle>
          <DialogDescription>
            {callInfo.pallet}.{callInfo.method}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Details */}
          {state === "idle" && (
            <>
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium">Transaction Details</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Pallet</dt>
                    <dd>{callInfo.pallet}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Method</dt>
                    <dd>{callInfo.method}</dd>
                  </div>
                  {fee && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Estimated Fee</dt>
                      <dd>{formatBalance(fee, 10, "DOT")}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium">Encoded Call</h4>
                <code className="block break-all text-xs text-muted-foreground">
                  {encodedCall.slice(0, 66)}...
                </code>
              </div>
            </>
          )}

          {/* Loading States */}
          {(state === "signing" || state === "submitting") && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                {state === "signing"
                  ? "Please sign the transaction in your wallet..."
                  : "Submitting transaction..."}
              </p>
            </div>
          )}

          {/* Success State */}
          {state === "success" && txHash && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-sm font-medium">Transaction Submitted!</p>
              <a
                href={`https://polkadot.subscan.io/extrinsic/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-primary hover:underline"
              >
                View on Subscan
              </a>
            </div>
          )}

          {/* Error State */}
          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="mt-4 text-sm font-medium">Transaction Failed</p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {state === "idle" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSign}>
                Sign & Submit
              </Button>
            </>
          )}
          {(state === "success" || state === "error") && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Hooks

### useSignAndSend

```typescript
// hooks/use-sign-tx.ts

"use client";

import { useAccount, useSigner } from "@luno-kit/react";
import { useChain } from "@/context/chain-context";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

interface SignAndSendOptions {
  onSigning?: () => void;
  onSubmitting?: () => void;
}

interface SignAndSendResult {
  hash: string;
  blockHash: string;
}

export function useSignAndSend() {
  const { address } = useAccount();
  const { signer } = useSigner();
  const { client } = useChain();

  const signAndSend = useCallback(
    async (
      encodedCall: string,
      options?: SignAndSendOptions
    ): Promise<SignAndSendResult> => {
      if (!client || !signer || !address) {
        throw new Error("Wallet not connected");
      }

      options?.onSigning?.();

      // Create the extrinsic from encoded call
      const tx = client.registry.createType("Extrinsic", encodedCall);

      // Sign the transaction
      await tx.signAsync(address, { signer });

      options?.onSubmitting?.();

      // Submit and wait for inclusion
      return new Promise((resolve, reject) => {
        tx.send((result) => {
          if (result.isInBlock) {
            resolve({
              hash: tx.hash.toHex(),
              blockHash: result.asInBlock.toHex(),
            });
          } else if (result.isError) {
            reject(new Error("Transaction failed"));
          }
        }).catch(reject);
      });
    },
    [client, signer, address]
  );

  const estimateFee = useCallback(
    (encodedCall: string) => {
      return useQuery({
        queryKey: ["fee", encodedCall, address],
        queryFn: async () => {
          if (!client || !address) return null;

          const tx = client.registry.createType("Extrinsic", encodedCall);
          const info = await client.rpc.payment.queryInfo(tx.toHex(), undefined);
          return info.partialFee.toBigInt();
        },
        enabled: !!client && !!address && !!encodedCall,
      });
    },
    [client, address]
  );

  return { signAndSend, estimateFee };
}
```

### useWalletAccounts

```typescript
// hooks/use-wallet.ts

"use client";

import { useAccount, useAccounts, useConnect, useDisconnect } from "@luno-kit/react";

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { data: accounts } = useAccounts();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    // Current account
    address,
    isConnected,
    isConnecting,

    // All accounts
    accounts: accounts ?? [],

    // Actions
    connect,
    disconnect,
    connectors,

    // Derived state
    hasWallet: connectors.length > 0,
  };
}
```

---

## Integration with Extrinsic Builder

### Submit Button Component

```typescript
// components/builder/submit-button.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { SignModal } from "@/components/wallet/sign-modal";
import { ConnectButton } from "@/components/wallet/connect-button";
import { toast } from "sonner";

interface SubmitButtonProps {
  encodedCall: string;
  callInfo: {
    pallet: string;
    method: string;
    args: Record<string, unknown>;
  };
  disabled?: boolean;
}

export function SubmitButton({
  encodedCall,
  callInfo,
  disabled,
}: SubmitButtonProps) {
  const { isConnected } = useWallet();
  const [signModalOpen, setSignModalOpen] = useState(false);

  if (!isConnected) {
    return <ConnectButton variant="default" />;
  }

  const handleSubmit = () => {
    if (!encodedCall || encodedCall === "0x") {
      toast.error("Please fill in the extrinsic parameters first");
      return;
    }
    setSignModalOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleSubmit}
        disabled={disabled || !encodedCall}
        className="w-full"
      >
        Sign & Submit
      </Button>

      <SignModal
        open={signModalOpen}
        onOpenChange={setSignModalOpen}
        encodedCall={encodedCall}
        callInfo={callInfo}
        onSuccess={(hash) => {
          toast.success(`Transaction submitted: ${hash.slice(0, 10)}...`);
        }}
        onError={(error) => {
          toast.error(`Transaction failed: ${error.message}`);
        }}
      />
    </>
  );
}
```

---

## Environment Variables

Add to `.env`:

```env
# Wallet Connect (optional, for mobile wallet support)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

---

## Testing Wallet Integration

### Manual Testing Checklist

- [ ] Connect with Polkadot.js extension
- [ ] Connect with Talisman
- [ ] Connect with SubWallet
- [ ] Switch accounts
- [ ] Disconnect
- [ ] Sign a simple transfer
- [ ] Handle user rejection
- [ ] Handle network errors
- [ ] Fee estimation display
- [ ] Transaction success flow
- [ ] Transaction error flow

### Test Networks

For testing without real funds:
- Pop Network Testnet: `wss://rpc1.paseo.popnetwork.xyz`
- Westend: `wss://westend-rpc.polkadot.io`
- Rococo: `wss://rococo-rpc.polkadot.io`

---

## Troubleshooting

### Common Issues

1. **"No wallet detected"**
   - Ensure browser extension is installed
   - Check if extension is allowed on the site
   - Try refreshing the page

2. **"Connection rejected"**
   - User denied permission in wallet
   - Check if app URL is allowed in wallet settings

3. **"Signing failed"**
   - User cancelled the signing request
   - Insufficient balance for fees
   - Account not authorized for this action

4. **SSR Hydration mismatch**
   - Ensure wallet-related components are client-only
   - Use dynamic imports with `ssr: false` if needed

---

## Related Documents

- [01-overview.md](./01-overview.md) - Implementation timeline
- [02-architecture.md](./02-architecture.md) - Provider architecture
- [03-input-components.md](./03-input-components.md) - AccountInput spec
