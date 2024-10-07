"use client";

import React, { useState, useEffect } from "react";
import { DedotClient, WsProvider } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import ExtrinsicBuilder from "@/components/builder/extrinsic-builder";
import InformationPane from "@/components/builder/information-pane";
import { Metadata } from "dedot/codecs";
import { ClientMethod } from "@/lib/parser";
import { Skeleton } from "@/components/ui/skeleton";

const BuilderPage: React.FC = () => {
  const [client, setClient] = useState<DedotClient<PolkadotApi> | null>(null);
  const [metadata, setMetadata] = useState<Metadata["latest"] | null>(null);
  const [extrinsic, setExtrinsic] = useState<ClientMethod | null>(null);
  const [loading, setLoading] = useState(true);

  async function getClient() {
    try {
      const client = await DedotClient.new<PolkadotApi>(
        new WsProvider("wss://rpc.polkadot.io")
      );
      setClient(client);
      setMetadata(client.metadata.latest);
    } catch (error) {
      console.error("Error connecting to Polkadot node:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getClient();
    return () => {
      client?.disconnect();
    };
  }, []);

  function handleExtrinsicChange(extrinsic: ClientMethod) {
    setExtrinsic(extrinsic);
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Extrinsic Builder</h1>
        <p className="text-xl text-gray-600">
          Build and analyze extrinsics for Polkadot and Kusama
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
                extrinsic={extrinsic}
                metadata={metadata}
                onExtrinsicChange={handleExtrinsicChange}
              />
            </div>
            <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg p-6">
              <InformationPane
                extrinsic={extrinsic}
                client={client}
                metadata={metadata}
                onExtrinsicChange={handleExtrinsicChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuilderPage;
