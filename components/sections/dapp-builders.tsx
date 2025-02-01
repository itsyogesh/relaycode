"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Copy } from "lucide-react";
import Balancer from "react-wrap-balancer";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

interface ComponentCard {
  id: string;
  title: string;
  code: string;
  description: string;
  visual: React.ReactNode;
}

const components: ComponentCard[] = [
  {
    id: "chain-aware",
    title: "Chain-Aware Forms",
    code: '<AddressInput chain="polkadot" />',
    description: "Full validation + DID resolution support",
    visual: (
      <div className="w-full rounded-lg border bg-card/50 p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-1/3 rounded-md bg-primary/10" />
            <div className="h-12 rounded-md border bg-background shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-green-500/20" />
            <div className="h-4 w-2/5 rounded-md bg-green-500/20" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "smart-inputs",
    title: "Smart Inputs",
    code: '<BalanceInput type="DOT" />',
    description: "Auto-formatting + unit conversion",
    visual: (
      <div className="w-full rounded-lg border bg-card/50 p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-1/4 rounded-md bg-primary/10" />
            <div className="flex gap-2">
              <div className="h-12 flex-1 rounded-md border bg-background shadow-sm" />
              <div className="flex h-12 w-24 items-center justify-center rounded-md border bg-background shadow-sm">
                <div className="h-5 w-12 rounded-md bg-primary/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "decoding",
    title: "Decoding Utilities",
    code: "<EncodedCallData txHash={hash} />",
    description: "Extrinsic tree analysis",
    visual: (
      <div className="w-full rounded-lg border bg-card/50 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-primary/10" />
            <div className="h-5 flex-1 rounded-md bg-primary/10" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-12 rounded-md bg-primary/10" />
              <div className="h-5 flex-1 rounded-md bg-primary/10" />
            </div>
            <div className="ml-6 flex items-center gap-2">
              <div className="h-5 w-20 rounded-md bg-primary/10" />
              <div className="h-5 flex-1 rounded-md bg-primary/10" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "dedot",
    title: "Dedot Type Integration",
    code: "Input = findInputComponent(dedotTypeId)",
    description: "Seamless integration with Dedot",
    visual: (
      <div className="w-full rounded-lg border bg-card/50 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-4 w-full rounded-md bg-primary/10" />
              <div className="h-12 rounded-md border bg-background shadow-sm" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded-md bg-primary/10" />
              <div className="h-12 rounded-md border bg-background shadow-sm" />
            </div>
          </div>
          <div className="h-24 rounded-md border bg-background p-3 shadow-sm">
            <div className="space-y-2">
              <div className="h-4 w-2/3 rounded-md bg-primary/10" />
              <div className="h-4 w-full rounded-md bg-primary/10" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

const benefits = [
  "Built-in error prevention",
  "Real-time type checking",
  "Auto-generated examples",
];

export function DappBuildersSection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  // Scroll configuration for the entire section
  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll configuration for the card content
  const { scrollYProgress: contentProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30 };
  const smoothProgress = useSpring(contentProgress, springConfig);
  const progress = useTransform(
    smoothProgress,
    [0, 0.5],
    [0, components.length - 1]
  );

  // Handle scroll snapping
  React.useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      setActiveIndex(Math.round(latest));
    });
    return () => unsubscribe();
  }, [progress]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-muted/50"
      style={{
        height: "160vh",
      }}
    >
      <div
        className="sticky top-16 h-screen flex items-center justify-center overflow-hidden"
        style={{
          scrollSnapAlign: "start",
          scrollSnapStop: "always",
        }}
      >
        <div className="w-full h-full">
          {" "}
          {/* Update 1 */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 py-24 sm:py-32">
              {" "}
              {/* Update 2 */}
              {/* Left Column - Scrolling Card */}
              <div ref={containerRef} className="relative lg:h-[160vh]">
                <div className="sticky top-24 h-[30rem] overflow-hidden">
                  {/* Main Card */}
                  <Card className="group relative h-full overflow-hidden border bg-background/80 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-90" />
                    <div className="absolute inset-0 transition-opacity group-hover:opacity-100 opacity-0">
                      <AuroraBackground
                        containerClassName="absolute inset-0"
                        className="h-full"
                      />
                    </div>
                    <div className="relative h-full p-6 sm:p-8">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="flex h-full flex-col"
                        >
                          <h3 className="pt-4 text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF2670] to-[#7916F3]">
                            {components[activeIndex].title}
                          </h3>
                          <div className="relative mt-8 mb-6 rounded-lg bg-muted/80 p-4 font-mono text-sm shadow-sm">
                            <pre>{components[activeIndex].code}</pre>
                            <button
                              onClick={async () => {
                                await navigator.clipboard.writeText(
                                  components[activeIndex].code
                                );
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className={cn(
                                "absolute right-3 top-3 rounded-md border p-2 hover:bg-background transition-colors",
                                copied && "text-green-500 border-green-500/20"
                              )}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mb-2 text-lg text-muted-foreground">
                            {components[activeIndex].description}
                          </p>
                          <div className="flex-1 flex items-center justify-center">
                            <div className="w-full max-w-2xl">
                              {components[activeIndex].visual}
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </Card>
                </div>
              </div>
              {/* Right Column - Content */}
              <div className="relative lg:sticky lg:top-24 lg:h-fit">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-8">
                    <div className="mb-4">
                      <StatusBadge status="soon" />
                    </div>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                      <Balancer>For dApp Builders</Balancer>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      <Balancer>
                        Tired of context-switching between docs and code? Our
                        components come with everything you need to build fast.
                      </Balancer>
                    </p>
                  </div>

                  <div className="mb-12 space-y-4">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <span>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  <p className="mb-8 text-lg font-medium">
                    Stop fighting the chain – start using it.
                  </p>

                  <Button size="lg" className="rounded-full" variant="outline">
                    Join Waitlist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
