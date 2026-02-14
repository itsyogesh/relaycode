"use client";

import React from "react";
import { ClientProvider, useClient } from "@/context/client";
import { usePalletContext } from "@/hooks/use-pallet-context";
import { Loader2 } from "lucide-react";
import type { ParamInputProps } from "@/components/params/types";

interface DocsSelectorPreviewProps {
  palletName: string;
  children: React.ReactElement<ParamInputProps>;
}

function SelectorPreviewInner({
  palletName,
  children,
}: DocsSelectorPreviewProps) {
  const { client, loading: clientLoading } = useClient();
  const { context, isLoading: contextLoading } = usePalletContext(
    client,
    palletName
  );

  const isConnecting = clientLoading;
  const isLoadingData = !clientLoading && (contextLoading || (!context && !!client));

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -top-8 right-0 flex items-center gap-1.5 text-xs text-muted-foreground">
        {isConnecting ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Connecting to Polkadot...</span>
          </>
        ) : isLoadingData ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Loading data...</span>
          </>
        ) : context ? (
          <>
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>Polkadot</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Connection failed</span>
          </>
        )}
      </div>
      {React.cloneElement(children, {
        client: client as any,
        palletContext: context,
        isContextLoading: clientLoading || contextLoading,
      })}
    </div>
  );
}

export function DocsSelectorPreview({
  palletName,
  children,
}: DocsSelectorPreviewProps) {
  return (
    <ClientProvider>
      <SelectorPreviewInner palletName={palletName}>
        {children}
      </SelectorPreviewInner>
    </ClientProvider>
  );
}
