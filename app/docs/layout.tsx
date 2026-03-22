import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";

export const metadata: Metadata = {
  title: "Docs — Guides, References, and Examples",
  description:
    "Developer documentation for Relaycode. Guides, API references, and examples for building on Polkadot with Substrate.",
  openGraph: {
    images: [{ url: "/api/og/docs", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og/docs"],
  },
  alternates: {
    canonical: "/docs",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{ title: "Relaycode" }}
    >
      {children}
    </DocsLayout>
  );
}
