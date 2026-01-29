"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DedotClient, WsProvider } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import ExtrinsicBuilder from "@/components/builder/extrinsic-builder";
import InformationPane from "@/components/builder/information-pane";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericTxCall } from "dedot/types";
import { useForm } from "react-hook-form";

export interface BuilderFormValues {
  section: string;
  method: string;
  [key: string]: string;
}

const BuilderPage: React.FC = () => {
  const [client, setClient] = useState<DedotClient<PolkadotApi> | null>(null);
  const [tx, setTx] = useState<GenericTxCall | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<BuilderFormValues>({
    defaultValues: {
      section: "",
      method: "",
    },
  });

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

  const handleTxChange = (tx: GenericTxCall) => {
    console.log("metadata", tx?.meta);
    setTx(() => tx);
  };

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
                builderForm={form}
              />
            </div>
            <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg p-6">
              <InformationPane
                client={client}
                tx={tx}
                builderForm={form}
                onTxChange={handleTxChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuilderPage;
