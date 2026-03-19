"use client";

import React from "react";
import { ClientProvider } from "@/context/client";
import { ContractProvider } from "@/context/contract-provider";
import { ContractStudio } from "@/components/studio/contract-studio";

export default function StudioPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <ClientProvider>
        <ContractProvider>
          <ContractStudio />
        </ContractProvider>
      </ClientProvider>
    </div>
  );
}
