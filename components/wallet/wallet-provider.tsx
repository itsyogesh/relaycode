"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LunoProvider } from "@luno-kit/react";
import { walletConfig } from "@/config/wallet";
import "@luno-kit/ui/styles.css";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LunoProvider config={walletConfig}>{children}</LunoProvider>
    </QueryClientProvider>
  );
}
