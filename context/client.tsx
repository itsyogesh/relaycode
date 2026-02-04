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
import { useChain } from "@luno-kit/react";

const DEFAULT_RPC = "wss://rpc.polkadot.io";

export interface ClientContextValue {
  client: DedotClient<PolkadotApi> | null;
  loading: boolean;
}

const ClientContext = createContext<ClientContextValue>({
  client: null,
  loading: true,
});

export const useClient = () => useContext(ClientContext);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<DedotClient<PolkadotApi> | null>(null);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef<DedotClient<PolkadotApi> | null>(null);

  const { chain } = useChain();
  const rpcUrl = chain?.rpcUrls?.webSocket?.[0] ?? DEFAULT_RPC;

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      // Disconnect previous client
      if (clientRef.current) {
        await clientRef.current.disconnect();
        clientRef.current = null;
      }

      setLoading(true);
      try {
        const newClient = await DedotClient.new<PolkadotApi>(
          new WsProvider(rpcUrl)
        );
        if (cancelled) {
          await newClient.disconnect();
          return;
        }
        clientRef.current = newClient;
        setClient(newClient);
      } catch (error) {
        console.error("Error connecting to chain:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    connect();

    return () => {
      cancelled = true;
      clientRef.current?.disconnect();
    };
  }, [rpcUrl]);

  return (
    <ClientContext.Provider value={{ client, loading }}>
      {children}
    </ClientContext.Provider>
  );
};
