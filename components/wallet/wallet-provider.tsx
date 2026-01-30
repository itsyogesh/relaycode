"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LunoKitProvider } from "@luno-kit/ui";
import { walletConfig } from "@/config/wallet";

const lunoTheme = {
  autoMode: true,
  light: {
    colors: {
      accentColor: "#7c3aed",
      connectButtonBackground: "#000000",
      connectButtonInnerBackground: "#000000",
      connectButtonText: "#ffffff",
      modalBackground: "#ffffff",
      modalBackdrop: "rgba(0, 0, 0, 0.5)",
      modalBorder: "#e5e5e5",
      modalText: "#0a0a0a",
      modalTextSecondary: "#737373",
      walletSelectItemBackground: "#f5f5f5",
      walletSelectItemBackgroundHover: "#e5e5e5",
      walletSelectItemText: "#0a0a0a",
      separatorLine: "#e5e5e5",
    },
    fonts: {
      body: "var(--font-geist-sans), system-ui, sans-serif",
    },
    radii: {
      modal: "12px",
      connectButton: "8px",
      walletSelectItem: "8px",
    },
  },
  dark: {
    colors: {
      accentColor: "#a855f7",
      connectButtonBackground: "#000000",
      connectButtonInnerBackground: "#000000",
      connectButtonText: "#ffffff",
      modalBackground: "#0a0a0a",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
      modalBorder: "#262626",
      modalText: "#fafafa",
      modalTextSecondary: "#a3a3a3",
      walletSelectItemBackground: "#171717",
      walletSelectItemBackgroundHover: "#262626",
      walletSelectItemText: "#fafafa",
      separatorLine: "#262626",
    },
    fonts: {
      body: "var(--font-geist-sans), system-ui, sans-serif",
    },
    radii: {
      modal: "12px",
      connectButton: "8px",
      walletSelectItem: "8px",
    },
  },
} as const;

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LunoKitProvider config={walletConfig} theme={lunoTheme}>
        {children}
      </LunoKitProvider>
    </QueryClientProvider>
  );
}
