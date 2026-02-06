import { createConfig } from "@luno-kit/react";
import { polkadot, kusama, westend } from "@luno-kit/react/chains";
import {
  polkadotjsConnector,
  talismanConnector,
  subwalletConnector,
} from "@luno-kit/react/connectors";

export const walletConfig = createConfig({
  appName: "Relaycode",
  chains: [polkadot, kusama, westend],
  connectors: [
    polkadotjsConnector(),
    talismanConnector(),
    subwalletConnector(),
  ],
});
