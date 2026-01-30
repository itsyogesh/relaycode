import { createConfig } from "@luno-kit/react";
import { polkadot, kusama } from "@luno-kit/react/chains";
import {
  polkadotjsConnector,
  talismanConnector,
  subwalletConnector,
} from "@luno-kit/react/connectors";

export const walletConfig = createConfig({
  appName: "Relaycode",
  chains: [polkadot, kusama],
  connectors: [
    polkadotjsConnector(),
    talismanConnector(),
    subwalletConnector(),
  ],
});
