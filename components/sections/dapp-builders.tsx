"use client";

import * as React from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

interface ComponentShowcase {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  visual: React.ReactNode;
}

const components: ComponentShowcase[] = [
  {
    id: "account",
    title: "Account Input",
    subtitle: "SS58 validation, wallet connect, recent addresses",
    code: '<Account client={client} onChange={setAddress} />',
    visual: (
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <div className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground/70">Destination</div>
          <div className="flex items-center gap-3 rounded-lg border bg-background/80 px-4 py-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#FF2670]/60 to-[#7916F3]/60" />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-sm truncate">15oF4uVnB...R7xkwQ1</div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-medium text-green-600">Valid</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground hover:border-primary/30 transition-colors cursor-pointer">Connected wallet</div>
          <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground hover:border-primary/30 transition-colors cursor-pointer">Address book</div>
        </div>
      </div>
    ),
  },
  {
    id: "balance",
    title: "Balance Input",
    subtitle: "Denomination switching, ED warnings, quick-fill",
    code: '<Balance client={client} onChange={setAmount} />',
    visual: (
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <div className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground/70">Amount</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border bg-background/80 px-4 py-3">
              <span className="font-mono text-lg font-medium">15.500</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-background/80 px-4 py-3">
              <div className="h-5 w-5 rounded-full bg-[#E6007A]" />
              <span className="text-sm font-semibold">DOT</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["25%", "50%", "75%", "Max"].map((pct) => (
            <div key={pct} className="rounded-lg border bg-muted/30 py-1.5 text-center text-xs font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all cursor-pointer">{pct}</div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="text-[11px] text-amber-600">Below existential deposit (1 DOT)</span>
        </div>
      </div>
    ),
  },
  {
    id: "vote",
    title: "Governance Vote",
    subtitle: "Standard, Split, SplitAbstain with conviction",
    code: '<Vote client={client} onChange={setVote} />',
    visual: (
      <div className="space-y-4 p-1">
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
          {["Standard", "Split", "SplitAbstain"].map((mode, i) => (
            <div key={mode} className={cn("flex-1 rounded-md py-2 text-center text-xs font-medium transition-all cursor-pointer", i === 0 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>{mode}</div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border-2 border-green-500/30 bg-green-500/5 py-3 text-center text-sm font-semibold text-green-600 cursor-pointer">Aye</div>
          <div className="rounded-lg border bg-muted/20 py-3 text-center text-sm text-muted-foreground cursor-pointer hover:border-red-500/30 transition-colors">Nay</div>
        </div>
        <div className="rounded-lg border bg-background/80 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground mb-0.5">Conviction</div>
              <div className="text-sm font-semibold">2x voting power</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Lock period</div>
              <div className="text-sm font-mono text-primary">~56 days</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "call",
    title: "Nested Call Builder",
    subtitle: "Pallet/method cascade from on-chain metadata",
    code: '<Call client={client} onChange={setBatchCall} />',
    visual: (
      <div className="space-y-3 p-1">
        <div className="space-y-2">
          <div className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground/70">Pallet</div>
          <div className="flex items-center rounded-lg border bg-background/80 px-4 py-2.5">
            <span className="text-sm font-medium">Balances</span>
            <svg className="ml-auto h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground/70">Method</div>
          <div className="flex items-center rounded-lg border bg-background/80 px-4 py-2.5">
            <span className="text-sm font-medium font-mono">transferKeepAlive</span>
            <svg className="ml-auto h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <div className="rounded-lg border border-dashed bg-muted/20 p-3 space-y-2">
          <div className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground/60">Auto-populated params</div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#FF2670]/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#FF2670]">AccountId</span>
            <span className="text-xs text-muted-foreground">dest</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#7916F3]/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#7916F3]">Balance</span>
            <span className="text-xs text-muted-foreground">value</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "bytes",
    title: "Bytes Encoder",
    subtitle: "Hex, Text, JSON, Base64, and File upload modes",
    code: '<Bytes client={client} onChange={setCallData} />',
    visual: (
      <div className="space-y-4 p-1">
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
          {["Hex", "Text", "JSON", "Base64", "File"].map((mode, i) => (
            <div key={mode} className={cn("flex-1 rounded-md py-1.5 text-center text-[11px] font-medium transition-all cursor-pointer", i === 0 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>{mode}</div>
          ))}
        </div>
        <div className="rounded-lg border bg-background/80 p-4 font-mono text-xs leading-relaxed text-muted-foreground break-all">
          0x68656c6c6f20776f726c64
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>11 bytes encoded</span>
          <span className="font-mono">Text: &quot;hello world&quot;</span>
        </div>
      </div>
    ),
  },
  {
    id: "enum",
    title: "Enum Selector",
    subtitle: "Metadata-driven variants with dynamic sub-fields",
    code: '<Enum client={client} typeId={id} onChange={set} />',
    visual: (
      <div className="space-y-3 p-1">
        <div className="space-y-2">
          <div className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground/70">MultiAddress</div>
          <div className="flex items-center rounded-lg border bg-background/80 px-4 py-2.5">
            <span className="text-sm font-medium">Id</span>
            <span className="ml-2 text-xs text-muted-foreground/50">AccountId32</span>
            <svg className="ml-auto h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-[#FF2670]/[0.03] to-[#7916F3]/[0.03] p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-primary">AccountId32</span>
          </div>
          <div className="flex items-center gap-3 rounded-md border bg-background/80 px-3 py-2">
            <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-[#FF2670]/60 to-[#7916F3]/60" />
            <span className="font-mono text-xs text-muted-foreground truncate">15oF4uVnB...R7xkwQ1</span>
          </div>
        </div>
      </div>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function DappBuildersSection() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progress = useTransform(
    scrollYProgress,
    [0.08, 0.92],
    [0, components.length - 1]
  );

  React.useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      const clamped = Math.max(0, Math.min(components.length - 1, Math.round(latest)));
      setActiveIndex(clamped);
    });
    return () => unsubscribe();
  }, [progress]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(components[activeIndex].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-muted/50"
      style={{ height: `${100 + components.length * 45}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Ambient gradient */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background: `radial-gradient(ellipse 80% 60% at ${activeIndex % 2 === 0 ? '30%' : '70%'} 50%, #FF2670, transparent), radial-gradient(ellipse 60% 80% at ${activeIndex % 2 === 0 ? '70%' : '30%'} 60%, #7916F3, transparent)`,
            }}
          />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
          <div className="grid w-full gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20 items-center">

            {/* Left Column — Header + Component Nav */}
            <div className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <StatusBadge status="live" />
                </div>
                <h2 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl">
                  <Balancer>
                    Components that speak{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF2670] to-[#7916F3]">
                      Substrate
                    </span>
                  </Balancer>
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  <Balancer>
                    Every input understands Polkadot&apos;s type system out of the box.
                    Validation, encoding, and edge cases handled -- so you ship
                    dApps, not workarounds.
                  </Balancer>
                </p>
              </motion.div>

              {/* Component list */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="mt-10 space-y-1.5"
              >
                {components.map((component, index) => (
                  <motion.button
                    key={component.id}
                    variants={itemVariants}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-300",
                      activeIndex === index
                        ? "bg-gradient-to-r from-[#FF2670]/[0.06] to-[#7916F3]/[0.06] shadow-sm"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold transition-all duration-300",
                        activeIndex === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        "font-heading font-semibold text-sm transition-colors",
                        activeIndex === index ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {component.title}
                      </div>
                      <div className="text-xs text-muted-foreground/70 truncate">
                        {component.subtitle}
                      </div>
                    </div>
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all duration-300",
                      activeIndex === index ? "bg-green-500/60" : "bg-transparent"
                    )} />
                  </motion.button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-10"
              >
                <Link href="/docs/components">
                  <Button size="lg" className="rounded-full group">
                    Explore All Components
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Column — Live Preview Card */}
            <div className="relative">
              {/* Glow behind card */}
              <div
                className="pointer-events-none absolute -inset-8 rounded-3xl opacity-20 blur-3xl transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at center, ${activeIndex % 2 === 0 ? '#FF2670' : '#7916F3'} 0%, transparent 70%)`,
                }}
              />

              <Card className="relative overflow-hidden border-0 bg-background/60 backdrop-blur-xl shadow-2xl shadow-black/5">
                {/* Card header gradient line */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#FF2670]/40 to-transparent" />

                <div className="p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {/* Component title */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-heading font-bold">
                            {components[activeIndex].title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {components[activeIndex].subtitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-[#FF2670]/40" />
                          <div className="h-2 w-2 rounded-full bg-[#7916F3]/40" />
                          <div className="h-2 w-2 rounded-full bg-muted" />
                        </div>
                      </div>

                      {/* Code snippet */}
                      <div className="relative mb-6 overflow-hidden rounded-xl bg-muted/60 border">
                        <div className="flex items-center justify-between border-b px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                            <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                          </div>
                          <button
                            onClick={handleCopy}
                            className="rounded-md p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <pre className="px-4 py-3 font-mono text-xs leading-relaxed overflow-x-auto">
                          {components[activeIndex].code}
                        </pre>
                      </div>

                      {/* Visual preview */}
                      <div className="rounded-xl border bg-gradient-to-br from-background to-muted/30 p-5">
                        <div className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground/50 mb-4">Preview</div>
                        {components[activeIndex].visual}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Card>

              {/* Progress indicator */}
              <div className="mt-6 flex justify-center gap-1.5">
                {components.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      activeIndex === index
                        ? "w-8 bg-gradient-to-r from-[#FF2670] to-[#7916F3]"
                        : "w-1.5 bg-primary/15 hover:bg-primary/25"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
