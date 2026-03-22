import "@/styles/globals.css";

import type { Viewport } from "next";
import { Nunito } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { RootProvider } from "fumadocs-ui/provider/next";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn, constructMetadata } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { DevTools } from "@/components/dev-tools";

interface RootLayoutProps {
  children: React.ReactNode;
}

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata = constructMetadata();

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Relaycode",
              url: "https://relaycode.org",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description:
                "Build extrinsics, write smart contracts, and interact with Substrate chains. Browser-based tools for the Polkadot ecosystem.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "itsyogesh",
                url: "https://github.com/itsyogesh",
              },
              funder: {
                "@type": "Organization",
                name: "Web3 Foundation",
                url: "https://web3.foundation",
              },
            }),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          nunito.variable,
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <RootProvider
          theme={{
            attribute: "class",
            defaultTheme: "system",
            enableSystem: true,
            disableTransitionOnChange: true,
          }}
        >
          <WalletProvider>
            {children}
          </WalletProvider>
          <Toaster richColors closeButton />
          <DevTools />
        </RootProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
