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
            <title>Contract Studio — Smart Contract IDE for Polkadot Hub | Relaycode</title>
            <meta name="description" content="Write Solidity, compile to EVM or PVM, and deploy smart contracts on Polkadot Hub. No CLI or MetaMask required." />
            <meta property="og:title" content="Contract Studio — Smart Contract IDE for Polkadot Hub" />
            <meta property="og:description" content="Write Solidity, compile to EVM or PVM, and deploy smart contracts on Polkadot Hub. No CLI or MetaMask required." />
            <meta property="og:image" content="/api/og/studio" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content="/api/og/studio" />
            <link rel="canonical" href="https://relaycode.org/studio" />
            <NavBar centerElement={<StudioNavCenter />} />
            <main className="flex flex-col flex-1 min-h-0">{children}</main>
          </div>
        </StudioProvider>
      </ContractProvider>
    </ClientProvider>
  );
}
