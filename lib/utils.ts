import { Metadata } from "next";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function constructMetadata({
  title = "Relaycode - The Developer Toolkit for Polkadot",
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | Relaycode`,
    },
    description,
    keywords: [
      "Relaycode",
      "Polkadot",
      "Substrate",
      "Extrinsics",
      "Builder",
      "Smart Contracts",
      "Solidity",
      "PolkaVM",
      "PVM",
      "Dedot",
      "Polkadot Hub",
    ],
    authors: [
      {
        name: "itsyogesh",
      },
    ],
    creator: "itsyogesh",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteConfig.url,
      title,
      description,
      siteName: "Relaycode",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@itsyogesh18",
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: "/",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`;
}
