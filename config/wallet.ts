import { createConfig } from "@luno-kit/react";
import {
  polkadot,
  kusama,
  westend,
  paseo,
  westendAssetHub,
  paseoAssetHub,
  polkadotAssetHub,
} from "@luno-kit/react/chains";
import {
  polkadotjsConnector,
  talismanConnector,
  subwalletConnector,
} from "@luno-kit/react/connectors";

export const walletConfig = createConfig({
  appName: "Relaycode",
  chains: [
    polkadot,
    kusama,
    westend,
    paseo,
    westendAssetHub,
    paseoAssetHub,
    polkadotAssetHub,
  ],
  connectors: [
    polkadotjsConnector(),
    talismanConnector(),
    subwalletConnector(),
  ],
});
