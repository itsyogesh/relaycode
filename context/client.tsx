// ApiContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { DedotClient, WsProvider } from "dedot";
import type { SubstrateApi } from "@dedot/chaintypes";

export interface ClientContextValue {
  client: DedotClient | null;
  setClient: (client: DedotClient) => void;
}

const ClientContext = createContext<ClientContextValue>({
  client: null,
  setClient: () => {},
});

export const useClient = () => {
  return useContext(ClientContext);
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ClientProvider = ({ children }: ApiProviderProps): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<DedotClient | null>(null);

  const getClient = useCallback(async () => {
    try {
      const client = await DedotClient.new<SubstrateApi>(
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

  const value: ClientContextValue = { client, setClient };

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
};
