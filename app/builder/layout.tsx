import type { Metadata } from "next";
import { NavBar } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Blocks } from "lucide-react";

export const metadata: Metadata = {
  title: "Relaycode Builder — Polkadot Extrinsic Builder",
  description:
    "Build, encode, decode, and submit any Substrate extrinsic visually. Supports all pallets across the Polkadot ecosystem.",
  openGraph: {
    images: [{ url: "/api/og/builder", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og/builder"],
  },
};

interface BuilderLayoutProps {
  children: React.ReactNode;
}

function BuilderNavCenter() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Blocks className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-foreground">Extrinsic Builder</span>
      <span className="text-muted-foreground hidden sm:inline">
        Build and analyze extrinsics for Polkadot
      </span>
    </div>
  );
}

export default function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar centerElement={<BuilderNavCenter />} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
