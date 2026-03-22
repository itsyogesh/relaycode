"use client";

import React from "react";
import { NavBar } from "@/components/layout/site-header";
import { ClientProvider } from "@/context/client";
import { ContractProvider } from "@/context/contract-provider";
import { StudioProvider } from "@/context/studio-provider";
import { StudioNavCenter } from "@/components/studio/studio-nav-center";

interface StudioLayoutProps {
  children: React.ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
  return (
    <ClientProvider>
      <ContractProvider>
        <StudioProvider>
          <div className="flex h-screen flex-col overflow-hidden">
            <title>Relaycode Studio — Polkadot Smart Contract IDE</title>
            <meta name="description" content="Browser-based smart contract IDE for Polkadot Hub. Write Solidity, compile to EVM or PVM, and deploy with native Polkadot wallets." />
            <meta property="og:image" content="/api/og/studio" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content="/api/og/studio" />
            <NavBar centerElement={<StudioNavCenter />} />
            <main className="flex flex-col flex-1 min-h-0">{children}</main>
          </div>
        </StudioProvider>
      </ContractProvider>
    </ClientProvider>
  );
}
