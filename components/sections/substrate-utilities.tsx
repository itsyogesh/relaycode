"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Copy,
  Calculator,
  Package,
  Scroll,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

function textToHex(text: string): string {
  return (
    "0x" +
    Array.from(text)
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

const utilities = [
  {
    icon: Calculator,
    title: "Multi-Format Address Converter",
    description: "Convert between different address formats across chains",
    gradient: "from-[#FF2670]/10 via-transparent to-transparent",
    status: "live",
  },
  {
    icon: Package,
    title: "SCALE Codec Playground",
    description: "Encode and decode SCALE format data",
    gradient: "from-[#7916F3]/10 via-transparent to-transparent",
    status: "live",
  },
  {
    icon: Scroll,
    title: "Runtime API Explorer",
    description: "Browse and test runtime APIs",
    gradient: "from-[#FF2670]/10 via-transparent to-transparent",
    status: "soon",
  },
  {
    icon: Search,
    title: "Transaction Metadata Analyser",
    description: "Deep dive into transaction metadata",
    gradient: "from-[#7916F3]/10 via-transparent to-transparent",
    status: "soon",
  },
];

const StatusBadge = ({
  status,
  className,
}: {
  status: "live" | "soon";
  className?: string;
}) => {
  const isLive = status === "live";
  return (
    <div className={className}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium border",
          isLive
            ? "bg-green-500/10 text-green-500 border-green-500/20"
            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        )}
      >
        <div
          className={cn(
            "size-1.5 rounded-full",
            isLive ? "bg-green-500 animate-pulse" : "bg-yellow-500"
          )}
        />
        {isLive ? "Live" : "Coming Soon"}
      </div>
    </div>
  );
};

export function SubstrateUtilitiesSection() {
  const [input, setInput] = useState("Hello Polkadot");
  const [copied, setCopied] = React.useState(false);
  const hexOutput = textToHex(input);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hexOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <section className="overflow-hidden bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl">
              Substrate Utilities
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Essential tools for developers and teams building on Substrate.
            </p>
          </motion.div>

          {/* Try Now Text Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 mb-4"
          >
            <p className="text-sm text-muted-foreground">
              Try instant Text/SCALE Conversion
            </p>
          </motion.div>

          {/* Live Converter Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative"
          >
            <div className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-[#FF2670]/[0.02] hover:to-[#7916F3]/[0.02]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="convert"
                    className="text-sm font-medium text-left block"
                  >
                    Enter text
                  </label>
                  <Input
                    id="convert"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text to convert..."
                    className="font-mono"
                  />
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-muted p-4 font-mono text-sm"
                  >
                    {hexOutput}
                    <button
                      onClick={copyToClipboard}
                      className={cn(
                        "absolute right-2 top-2 rounded-md border p-2 hover:bg-background transition-colors",
                        copied && "text-green-500 border-green-500/20"
                      )}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Utilities Grid */}
          <div className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid gap-8 sm:grid-cols-2"
            >
              {utilities.map((utility, index) => (
                <motion.div
                  key={utility.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="group relative overflow-hidden rounded-lg border bg-card p-8 shadow-sm"
                >
                  <StatusBadge
                    status={utility.status as "live" | "soon"}
                    className="absolute top-4 right-4 z-20"
                  />
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-[#FF2670]/20 to-[#7916F3]/20">
                      <utility.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1 text-left">
                      <h3 className="font-bold font-heading tracking-tight">
                        {utility.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {utility.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${utility.gradient}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto"
            >
              Explore Utilities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link
              href="https://github.com/itsyogesh/relaycode/issues"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-dotted border-muted-foreground/50 hover:border-foreground pb-0.5"
            >
              <Plus className="h-4 w-4" />
              Suggest a Tool
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
