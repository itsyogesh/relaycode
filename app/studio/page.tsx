"use client";

import React from "react";
import { ClientProvider } from "@/context/client";
import { ContractProvider } from "@/context/contract-provider";
import { StudioProvider } from "@/context/studio-provider";
import { StudioLayout } from "@/components/studio/studio-layout";

export default function StudioPage() {
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <ClientProvider>
        <ContractProvider>
          <StudioProvider>
            <StudioLayout />
          </StudioProvider>
        </ContractProvider>
      </ClientProvider>
    </div>
  );
}
