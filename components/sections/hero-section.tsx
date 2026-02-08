"use client";

import { motion } from "framer-motion";
import Balancer from "react-wrap-balancer";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { ArrowRight, PlayCircle } from "lucide-react";
import { PolkadotIcon } from "@/components/icons/polkadot-icon";

export function HeroSection() {
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
            <div className="mb-6 flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
              <PolkadotIcon className="h-5 w-5 text-[#FF2670]" />
              <span>Funded by Web3 Foundation Grants</span>
            </div>

            {/* Main content */}
            <h1 className="text-4xl font-semibold tracking-tight font-heading sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-[#FF2670] to-[#7916F3] pb-4">
              <Balancer>Polkadot Extrinsics, Simplified</Balancer>
            </h1>
            <p className="mt-4 text-md sm:text-lg leading-8 text-muted-foreground max-w-2xl">
              <Balancer>
                Relaycode provides developer-focused tools and utilities to
                simplify, build and use Polkadot extrinsics with real-time
                insights
              </Balancer>
            </p>
            <div className="mt-10">
              <Link href="/builder">
                <Button
                  size="lg"
                  className="text-lg rounded-full group px-8 py-3 h-auto"
                >
                  Try Extrinsic Builder (Beta)
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Demo Section */}
            <div className="mt-20 w-full">
              {/* Ecosystem logos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 place-items-center gap-6 sm:gap-x-12 opacity-60 mb-12 px-4">
                <div className="flex items-center gap-2">
                  <img className="h-7" src="/logos/w3f.svg" alt="Web3 Foundation" />
                  <span className="text-sm font-medium text-muted-foreground">Web3 Foundation</span>
                </div>
                <div className="flex items-center gap-2">
                  <img className="h-7" src="/logos/polkadot-circle.svg" alt="Polkadot" />
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

              <div className="relative mx-auto max-w-5xl rounded-xl overflow-hidden shadow-xl">
                <div className="relative pb-[56.25%]">
                  <img
                    src="/placeholder.svg?height=720&width=1280"
                    alt="Relaycode Demo"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-background/80 backdrop-blur-sm rounded-full"
                    >
                      <PlayCircle className="mr-2 h-6 w-6" />
                      Watch Demo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AuroraBackground>
    </div>
  );
}
