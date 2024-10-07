"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { FiArrowRight } from "react-icons/fi";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <div className="text-3xl md:text-7xl font-bold dark:text-white text-center px-24">
            Welcome to Relaycode
          </div>
          <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4 px-24 text-center">
            An intuitive extrinsics builder for Polkadot ecosystem. Simplify
            complex pallet interactions with real-time encoding, wallet
            integration, and shareable snippets.
          </div>
          <Link href="/builder">
            <Button size="lg" className="rounded-full text-xl">
              <div className="flex items-center">
                <span className="mr-2">Try Builder!</span>
                <FiArrowRight />
              </div>
            </Button>
          </Link>
        </motion.div>
      </AuroraBackground>
    </main>
  );
}
