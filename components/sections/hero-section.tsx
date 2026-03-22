"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Balancer from "react-wrap-balancer";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { ArrowRight, PlayCircle } from "lucide-react";
import { PolkadotIcon } from "@/components/icons/polkadot-icon";

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start">
      <AuroraBackground className="w-full flex-1">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Pre-header badge */}
            <Link
              href="/studio"
              className="mb-6 flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm hover:bg-background/70 transition-colors group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span>New: Contract Studio is live</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Main content */}
            <h1 className="text-4xl font-semibold tracking-tight font-heading sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-[#FF2670] to-[#7916F3] pb-4">
              <Balancer>The Developer Toolkit for Polkadot</Balancer>
            </h1>
            <p className="mt-4 text-md sm:text-lg leading-8 text-muted-foreground max-w-2xl">
              <Balancer>
                Build and submit any substrate extrinsic visually, write
                Solidity smart contracts, and deploy to Polkadot Hub - all
                from your browser.
              </Balancer>
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link href="/studio">
                <Button
                  size="lg"
                  className="text-lg rounded-full group px-8 py-3 h-auto"
                >
                  Open Studio
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/builder">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg rounded-full px-8 py-3 h-auto"
                >
                  Extrinsic Builder
                </Button>
              </Link>
            </div>

            {/* Demo Section */}
            <div className="mt-20 w-full">
              {/* Ecosystem logos */}
              <div className="mx-auto max-w-2xl grid grid-cols-2 sm:grid-cols-4 place-items-center gap-6 sm:gap-x-12 opacity-60 mb-12 px-4">
                <div className="flex items-center gap-2">
                  <img className="h-7" src="/logos/w3f.svg" alt="Web3 Foundation" />
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Web3 Foundation</span>
                </div>
                <div className="flex items-center gap-2">
                  <img className="h-7" src="/logos/polkadot.svg" alt="Polkadot" />
                  <span className="text-sm font-medium text-muted-foreground">Polkadot</span>
                </div>
                <div className="flex items-center gap-2">
                  <img className="h-7" src="/logos/substrate.svg" alt="Substrate" />
                  <span className="text-sm font-medium text-muted-foreground">Substrate</span>
                </div>
                <div className="flex items-center gap-2">
                  <img className="h-7 rounded" src="/logos/dedot.png" alt="Dedot" />
                  <span className="text-sm font-medium text-muted-foreground">Dedot</span>
                </div>
              </div>

              <div
                className="relative mx-auto max-w-5xl rounded-xl overflow-hidden shadow-xl border border-border/50 cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <img
                  src={isPlaying ? "/relaycode-demo.gif" : "/relaycode-demo-poster.png"}
                  alt="Relaycode Demo — bi-directional extrinsic builder"
                  className="w-full h-auto"
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-background/80 backdrop-blur-sm rounded-full"
                    >
                      <PlayCircle className="mr-2 h-6 w-6" />
                      Watch Demo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </AuroraBackground>
    </div>
  );
}
