import type { Metadata } from "next";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { StudioClientLayout } from "@/components/studio/studio-client-layout";

const title = "Contract Studio — Smart Contract IDE for Polkadot Hub";
const description =
  "Write Solidity, compile to EVM or PVM, and deploy smart contracts on Polkadot Hub. No CLI or MetaMask required.";
const canonicalUrl = `${siteConfig.url}/studio`;
const imageUrl = `${siteConfig.url}/api/og/studio`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    type: "website",
    url: canonicalUrl,
    title,
    description,
    siteName: siteConfig.name,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [imageUrl],
  },
};

interface StudioLayoutProps {
  children: ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
  return <StudioClientLayout>{children}</StudioClientLayout>;
}
