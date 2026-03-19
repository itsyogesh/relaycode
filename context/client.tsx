"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { DedotClient, WsProvider } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import type { PolkadotAssetHubApi, WestendAssetHubApi, PaseoAssetHubApi } from "@dedot/chaintypes";
import { useChain } from "@luno-kit/react";
import { isAssetHubGenesis, type GenericChainClient } from "@/lib/chain-types";

const DEFAULT_RPC = "wss://rpc.polkadot.io";

export interface ClientContextValue {
  client: GenericChainClient | null;
  loading: boolean;
  isAssetHub: boolean;
}

const ClientContext = createContext<ClientContextValue>({
  client: null,
  loading: true,
  isAssetHub: false,
});

export const useClient = () => useContext(ClientContext);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<GenericChainClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAssetHub, setIsAssetHub] = useState(false);
  const clientRef = useRef<GenericChainClient | null>(null);

  const { chain } = useChain();
  const rpcUrl = chain?.rpcUrls?.webSocket?.[0] ?? DEFAULT_RPC;

  useEffect(() => {
    let cancelled = false;

    // Capture previous client before clearing the ref, so only connect()
    // handles disconnection (avoids a race with the cleanup function).
    const prevClient = clientRef.current;
    clientRef.current = null;

    // Immediately clear client and show loading when chain changes
    setClient(null);
    setLoading(true);

    const connect = async () => {
      // Defer disconnect of previous client so other cleanup effects
      // (e.g. LunoKit subscription teardown) can run first.
      if (prevClient) {
        setTimeout(() => {
          prevClient.disconnect().catch(() => {});
        }, 100);
      }

      if (cancelled) return;

      try {
        const genesisHash = chain?.genesisHash?.toLowerCase() ?? "";
        const isHub = isAssetHubGenesis(genesisHash);

        let newClient: GenericChainClient;
        if (genesisHash === "0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f") {
          newClient = await DedotClient.new<PolkadotAssetHubApi>(new WsProvider(rpcUrl));
        } else if (genesisHash === "0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9") {
          newClient = await DedotClient.new<WestendAssetHubApi>(new WsProvider(rpcUrl));
        } else if (genesisHash === "0xd6eec26135305a8ad257a20d003357284c8aa03d0bdb2b357ab0a22371e11ef2") {
          newClient = await DedotClient.new<PaseoAssetHubApi>(new WsProvider(rpcUrl));
        } else {
          newClient = await DedotClient.new<PolkadotApi>(new WsProvider(rpcUrl));
        }

        if (cancelled) {
          newClient.disconnect().catch(() => {});
          return;
        }
        clientRef.current = newClient;
        setClient(newClient);
        setIsAssetHub(isHub);
      } catch (error) {
        console.error("Error connecting to chain:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    connect();

    return () => {
      cancelled = true;
    };
  }, [rpcUrl]);

  return (
    <ClientContext.Provider value={{ client, loading, isAssetHub }}>
      {children}
    </ClientContext.Provider>
  );
};
