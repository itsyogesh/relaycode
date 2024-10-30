"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DedotClient, WsProvider } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import ExtrinsicBuilder from "@/components/builder/extrinsic-builder";
import InformationPane from "@/components/builder/information-pane";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericTxCall } from "dedot/types";

const BuilderPage: React.FC = () => {
  const [client, setClient] = useState<DedotClient<PolkadotApi> | null>(null);
  const [tx, setTx] = useState<GenericTxCall<"v2"> | null>(null);
  const [section, setSection] = useState<{
    text: string;
    value: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const getClient = useCallback(async () => {
    try {
      const client = await DedotClient.new<PolkadotApi>(
        new WsProvider("wss://rpc.polkadot.io")
      );
      setClient(client);
    } catch (error) {
      console.error("Error connecting to Polkadot node:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getClient();
    return () => {
      client?.disconnect();
    };
  }, []);

  const handleTxChange = (tx: GenericTxCall<"v2">) => {
    console.log("tx changed", tx);
    console.log("metadata", tx?.meta);
    setTx(() => tx);
  };

  function handleSectionChange(
    section: { text: string; value: number } | null
  ) {
    setSection(section);
  }

  console.log("transaction", tx);

  const SkeletonUI = () => (
    <>
      <div className="w-full lg:w-1/2">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-10 w-1/3" />
      </div>
      <div className="w-full lg:w-1/2">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-6 w-full" />
      </div>
    </>
  );

  console.log("tx in page body", tx);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Extrinsic Builder</h1>
        <p className="text-xl text-gray-600">
          Extrinsics builder for the Polkadot ecosystem
        </p>
      </header>
      <div className="flex flex-col lg:flex-row gap-8">
        {loading || !client ? (
          <SkeletonUI />
        ) : (
          <>
            <div className="w-full lg:w-1/2">
              <ExtrinsicBuilder
                client={client}
                tx={tx}
                onTxChange={handleTxChange}
                onSectionChange={handleSectionChange}
              />
            </div>
            <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg p-6">
              <InformationPane client={client} tx={tx} section={section} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuilderPage;
