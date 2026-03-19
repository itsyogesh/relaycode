"use client";

import React from "react";
import { ClientProvider } from "@/context/client";
import { ContractProvider } from "@/context/contract-provider";
import { ContractStudio } from "@/components/studio/contract-studio";

export default function StudioPage() {
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <ClientProvider>
        <ContractProvider>
          <ContractStudio />
        </ContractProvider>
      </ClientProvider>
    </div>
  );
}
