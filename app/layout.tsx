import "@/styles/globals.css";

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

export const metadata = constructMetadata();

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
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
