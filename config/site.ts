import { SiteConfig } from "@/types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "Relaycode",
  description:
    "Build extrinsics, write smart contracts, and interact with Substrate chains. Browser-based tools for the Polkadot ecosystem.",
  url: site_url,
  ogImage: `${site_url}/api/og/home`,
  links: {
    twitter: "https://twitter.com/itsyogesh18",
    github: "https://github.com/itsyogesh",
  },
  mailSupport: "hello@itsyogesh.fyi",
};
