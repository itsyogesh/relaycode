"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { PolkadotIcon } from "@/components/icons/polkadot-icon";
import { TalismanIcon } from "@/components/icons/talisman-icon";
import { NovaWalletIcon } from "@/components/icons/nova-wallet-icon";
import { SubWalletIcon } from "@/components/icons/subwallet-icon";
import { RelaycodeIcon } from "@/components/icons/relaycode-logo";
import { LoadingSkeleton } from "./loading-skeleton";
import { ConnectedSteps } from "./connected-steps";
import type React from "react";
import { BlockIcon } from "../icons/block-icon";

const steps = [
  {
    title: "Pick what you want to do",
    description: "Choose from staking, NFTs, and more",
  },
  {
    title: "Fill human-friendly forms",
    description: "No more cryptic parameters",
  },
  {
    title: "We handle the encoding",
    description: "All the Polkadot magic, automated",
  },
];

const WalletIcon = ({
  children,
  className,
  angle,
}: {
  children: React.ReactNode;
  className?: string;
  angle?: number;
}) => (
  <motion.div
    className={cn(
      "absolute flex h-12 w-12 items-center justify-center rounded-xl bg-card shadow-md",
      className
    )}
    style={{
      transform: `rotate(${angle}deg) translateY(-60px) rotate(-${angle}deg)`,
    }}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    {children}
  </motion.div>
);

const features = [
  {
    title: "All Pallets Supported",
    description: "Staking • Governance • XCM • Assets • Crowdloans + 40+ more",
    illustration: (
      <div className="relative h-[200px] overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/50 p-6">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="aspect-square rounded-lg bg-[#FF2670]/5 p-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { delay: i * 0.1 },
              }}
            >
              <motion.div className="flex h-full items-center justify-center rounded-md bg-card">
                <BlockIcon className="opacity-80" />
                <motion.div
                  className="absolute inset-0 rounded-md"
                  animate={{
                    boxShadow: [
                      "0 0 0 rgba(255, 38, 112, 0)",
                      "0 0 20px rgba(255, 38, 112, 0.2)",
                      "0 0 0 rgba(255, 38, 112, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"
          animate={{
            opacity: [0, 0.5, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>
    ),
  },
  {
    title: "Bi-Directional Editing",
    description:
      "Toggle form inputs and encoded data • Perfect sync with real-time validation",
    illustration: (
      <div className="relative h-[200px] overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/50 p-6">
        <div className="flex h-full gap-4">
          <div className="flex-1 space-y-3">
            <motion.div
              className="h-10 rounded-lg bg-card p-3"
              animate={{
                backgroundColor: [
                  "rgba(255, 38, 112, 0.05)",
                  "rgba(121, 22, 243, 0.05)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <div className="h-4 w-2/3 rounded-md bg-primary/10" />
            </motion.div>
            <motion.div
              className="h-10 rounded-lg bg-card p-3"
              animate={{
                backgroundColor: [
                  "rgba(121, 22, 243, 0.05)",
                  "rgba(255, 38, 112, 0.05)",
                ],
              }}
              transition={{
                duration: 2,
                delay: 0.3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <div className="h-4 w-1/2 rounded-md bg-primary/10" />
            </motion.div>
          </div>
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-full rounded-lg border bg-card p-3"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(255, 38, 112, 0)",
                  "0 0 20px rgba(255, 38, 112, 0.1)",
                  "0 0 0 rgba(255, 38, 112, 0)",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              <div className="space-y-2">
                <motion.div
                  className="h-3 rounded-md bg-primary/10"
                  animate={{ width: ["100%", "60%", "100%"] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                  className="h-3 rounded-md bg-primary/10"
                  animate={{ width: ["70%", "40%", "70%"] }}
                  transition={{
                    duration: 3,
                    delay: 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Wallet-Ready Workflow",
    description:
      "Polkadot.js • Talisman • Nova • SubWallet - Connect & Sign in 1 Click",
    illustration: (
      <div className="relative h-[200px] overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/50 p-6">
        <div className="relative flex h-full items-center justify-center">
          {/* Animated circles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
              }}
              style={{
                width: `${180 + i * 60}px`,
                height: `${180 + i * 60}px`,
              }}
            >
              <div
                className="h-full w-full rounded-full border border-primary/20"
                style={{
                  opacity: 0.3 - i * 0.05,
                }}
              />
            </motion.div>
          ))}

          <div className="relative">
            {/* Center Relaycode Logo */}
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 relative overflow-hidden"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-primary/30 to-transparent"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <RelaycodeIcon className="h-8 w-8 text-primary relative z-10" />
            </motion.div>

            {/* Polkadot.js - Top */}
            <motion.div
              className="absolute"
              style={{
                top: "-60px",
                left: "-70%",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6007A] shadow-md">
                <PolkadotIcon className="h-6 w-6 text-white" />
              </div>
            </motion.div>

            {/* Talisman - Outer Right */}
            <motion.div
              className="absolute"
              style={{
                top: "-20px",
                right: "-120px",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D6FE81] shadow-md">
                <TalismanIcon className="h-6 w-6" />
              </div>
            </motion.div>

            {/* Nova - Outer Left */}
            <motion.div
              className="absolute"
              style={{
                top: "-20px",
                left: "-120px",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-md">
                <NovaWalletIcon className="h-6 w-6" />
              </div>
            </motion.div>

            {/* SubWallet - Inner Right */}
            <motion.div
              className="absolute"
              style={{
                top: "40px",
                right: "-80px",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-md">
                <SubWalletIcon className="h-6 w-6" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "One-Click Templates",
    description: "Get React/TypeScript snippets for your dApp's integration",
    illustration: (
      <div className="relative h-[200px] overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/50 p-6">
        <div className="grid h-full grid-cols-2 gap-3">
          <div className="space-y-3">
            <motion.div
              className="rounded-lg bg-card p-3"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(255, 38, 112, 0)",
                  "0 0 20px rgba(255, 38, 112, 0.1)",
                  "0 0 0 rgba(255, 38, 112, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <div className="space-y-2">
                <motion.div
                  className="h-3 w-4/5 rounded-md bg-primary/10"
                  animate={{ width: ["80%", "60%", "80%"] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                  className="h-3 w-3/5 rounded-md bg-primary/10"
                  animate={{ width: ["60%", "40%", "60%"] }}
                  transition={{
                    duration: 3,
                    delay: 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              </div>
            </motion.div>

            {/* Modified second item to match circle + line pattern */}
            <div className="rounded-lg bg-card p-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary/10" />
                <div className="h-3 flex-1 rounded-md bg-primary/10" />
              </div>
            </div>

            <div className="rounded-lg bg-card p-3">
              <div className="space-y-2">
                <div className="h-3 w-2/3 rounded-md bg-primary/10" />
                <div className="h-3 w-1/2 rounded-md bg-primary/10" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-card p-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary/10" />
                <div className="h-3 flex-1 rounded-md bg-primary/10" />
              </div>
            </div>
            <motion.div
              className="rounded-lg bg-card p-3"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(121, 22, 243, 0)",
                  "0 0 20px rgba(121, 22, 243, 0.1)",
                  "0 0 0 rgba(121, 22, 243, 0)",
                ],
              }}
              transition={{
                duration: 2,
                delay: 1,
                repeat: Number.POSITIVE_INFINITY,
              }}
            >
              <div className="space-y-2">
                <motion.div
                  className="h-3 rounded-md bg-primary/10"
                  animate={{ width: ["60%", "100%", "60%"] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                  className="h-3 rounded-md bg-primary/10"
                  animate={{ width: ["40%", "70%", "40%"] }}
                  transition={{
                    duration: 3,
                    delay: 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              </div>
            </motion.div>
            <div className="rounded-lg bg-card p-3">
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded-md bg-primary/10" />
                <div className="h-3 w-1/2 rounded-md bg-primary/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

const DemoPreview = () => {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-background to-muted shadow-2xl">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 text-center">
          <div className="inline-flex items-center rounded-lg bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
            relaycode.org/builder
          </div>
        </div>
      </div>
      <LoadingSkeleton />
    </div>
  );
};

export function ExtrinsicBuilderSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-background py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Extrinsic Builder is live on Polkadot
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Seriously – it&apos;s easier than DeFi on Ethereum.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ y }}
            className="relative mt-16"
          >
            <DemoPreview />

            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2">
              <Button size="lg" className="rounded-full">
                Try Builder (It&apos;s Free){" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="mx-auto mt-40 max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            From &apos;Huh?&apos; to &apos;Aha!&apos; in 3 Steps
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16"
          >
            <ConnectedSteps
              steps={[
                {
                  number: 1,
                  title: "Pick what you want to do",
                  description: "Choose from staking, NFTs, and more",
                },
                {
                  number: 2,
                  title: "Fill human-friendly forms",
                  description: "No more cryptic parameters",
                },
                {
                  number: 3,
                  title: "We handle the encoding",
                  description: "All the Polkadot magic, automated",
                },
              ]}
            />
          </motion.div>
        </div>

        <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/50 shadow-sm transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                {feature.illustration}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
