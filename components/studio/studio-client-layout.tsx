"use client";

import type { ReactNode } from "react";

import { NavBar } from "@/components/layout/site-header";
import { ClientProvider } from "@/context/client";
import { ContractProvider } from "@/context/contract-provider";
import { StudioProvider } from "@/context/studio-provider";
import { StudioNavCenter } from "@/components/studio/studio-nav-center";

interface StudioClientLayoutProps {
  children: ReactNode;
}

export function StudioClientLayout({ children }: StudioClientLayoutProps) {
  return (
    <ClientProvider>
      <ContractProvider>
        <StudioProvider>
          <div className="flex h-screen flex-col overflow-hidden">
            <NavBar centerElement={<StudioNavCenter />} />
            <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          </div>
        </StudioProvider>
      </ContractProvider>
    </ClientProvider>
  );
}
