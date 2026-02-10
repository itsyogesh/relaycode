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
        const newClient = await DedotClient.new<PolkadotApi>(
          new WsProvider(rpcUrl)
        );
        if (cancelled) {
          newClient.disconnect().catch(() => {});
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
    };
  }, [rpcUrl]);

  return (
    <ClientContext.Provider value={{ client, loading }}>
      {children}
    </ClientContext.Provider>
  );
};
