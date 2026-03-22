"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, FileCode, Play, Rocket, Upload, ToggleRight, Package, Wallet } from "lucide-react";

// --- Animated Studio Mockup ---

function StudioMockup() {
  const codeLines = [
    { text: "// SPDX-License-Identifier: MIT", color: "text-green-500" },
    { text: 'pragma solidity ^0.8.20;', color: "text-purple-400" },
    { text: "", color: "" },
    { text: 'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";', color: "text-yellow-500" },
    { text: 'import "@openzeppelin/contracts/access/Ownable.sol";', color: "text-yellow-500" },
    { text: "", color: "" },
    { text: "contract PolkaSwap is ERC20, Ownable {", color: "text-blue-400" },
    { text: "    mapping(address => uint256) public liquidity;", color: "text-muted-foreground" },
    { text: "    uint256 public totalLiquidity;", color: "text-muted-foreground" },
    { text: "", color: "" },
    { text: "    constructor() ERC20(\"PolkaSwap\", \"PSWAP\") Ownable(msg.sender) {", color: "text-blue-400" },
    { text: "        _mint(msg.sender, 1000000 * 10 ** decimals());", color: "text-muted-foreground" },
    { text: "    }", color: "text-muted-foreground" },
    { text: "", color: "" },
    { text: "    function addLiquidity() external payable {", color: "text-blue-400" },
    { text: "        liquidity[msg.sender] += msg.value;", color: "text-muted-foreground" },
    { text: "        totalLiquidity += msg.value;", color: "text-muted-foreground" },
    { text: "    }", color: "text-muted-foreground" },
    { text: "}", color: "text-blue-400" },
  ];

  const files = [
    { name: "PolkaSwap.sol", active: true },
    { name: "Router.sol", active: false },
    { name: "IPool.sol", active: false },
  ];

  return (
    <motion.div
      className="relative mx-auto max-w-5xl"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Browser chrome */}
      <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-background/80 text-[11px] text-muted-foreground font-mono">
              relaycode.org/studio
            </div>
          </div>
        </div>

        {/* Studio content */}
        <div className="flex h-[510px] bg-background">
          {/* Left: File explorer */}
          <div className="w-[160px] border-r bg-muted/20 flex flex-col">
            <div className="px-3 py-2 border-b">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Files</span>
            </div>
            <div className="px-2 py-1 flex-1">
              {files.map((f, i) => (
                <motion.div
                  key={f.name}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] ${
                    f.active ? "bg-accent text-foreground" : "text-muted-foreground"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <FileCode className="h-3 w-3" />
                  {f.name}
                </motion.div>
              ))}
            </div>
            <div className="px-2 py-2 border-t">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>+</span> New File
              </div>
            </div>
          </div>

          {/* Center: Editor */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tabs */}
            <div className="flex items-center h-8 bg-muted/30 border-b">
              {files.map((f, i) => (
                <motion.div
                  key={f.name}
                  className={`flex items-center gap-1.5 px-3 h-full text-[11px] border-r ${
                    f.active ? "bg-background text-foreground" : "text-muted-foreground"
                  }`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  {f.name}
                </motion.div>
              ))}
            </div>

            {/* Code */}
            <div className="flex-1 overflow-hidden p-3 font-mono text-[11px] leading-[18px]">
              {codeLines.map((line, i) => (
                <motion.div
                  key={i}
                  className="flex"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  <span className="w-6 text-right mr-3 text-muted-foreground/40 select-none">{i + 1}</span>
                  <span className={line.color}>{line.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Output panel */}
            <motion.div
              className="border-t bg-muted/40 flex flex-col"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.3 }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50">
                <span className="text-[10px] font-medium text-muted-foreground">Output</span>
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-[10px] text-green-600 dark:text-green-400">
                  Compiled
                </span>
                <span className="text-[10px] text-muted-foreground">
                  (PolkaSwap.sol:PolkaSwap)
                </span>
              </div>
              <div className="px-3 py-2 space-y-1">
                <motion.div
                  className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5 }}
                >
                  <Check className="h-3 w-3" />
                  Compiled successfully (PolkaSwap.sol:PolkaSwap)
                </motion.div>
                <motion.div
                  className="flex items-start gap-1.5 text-[10px] text-yellow-600 dark:text-yellow-400"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6 }}
                >
                  <span className="mt-0.5">&#9888;</span>
                  Warning: SPDX license identifier not provided in source file
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right: Compile + Deploy */}
          <div className="w-[220px] border-l bg-muted/10 overflow-hidden">
            {/* Compile section */}
            <div className="p-3 border-b">
              <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Compile</div>
              <motion.div
                className="flex items-center gap-1 mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                <div className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">EVM</div>
                <div className="px-2 py-0.5 rounded text-[10px] bg-foreground text-background font-medium">PVM (Polkadot)</div>
              </motion.div>
              <motion.div
                className="w-full h-7 rounded bg-foreground text-background text-[11px] font-medium flex items-center justify-center gap-1"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
              >
                <Play className="h-3 w-3" /> Compile
              </motion.div>

              {/* Contract info */}
              <motion.div
                className="mt-2 rounded border bg-muted/50 p-2"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.4 }}
              >
                <div className="flex items-center gap-1 text-[10px] font-medium">
                  <FileCode className="h-3 w-3 text-muted-foreground" />
                  PolkaSwap
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">9,265 bytes &middot; 52 ABI entries</div>
                <div className="flex items-center gap-1 text-[9px] text-green-600 dark:text-green-400 mt-0.5">
                  <Check className="h-2.5 w-2.5" /> Compiled
                </div>
              </motion.div>
            </div>

            {/* Deploy section */}
            <div className="p-3">
              <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Deploy</div>
              <motion.div
                className="space-y-1.5"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.5 }}
              >
                <div>
                  <div className="text-[9px] text-muted-foreground mb-0.5">admin <span className="text-muted-foreground/50">address</span></div>
                  <div className="h-5 rounded border bg-background px-1.5 text-[9px] text-muted-foreground flex items-center">0x...</div>
                </div>
                <div className="w-full h-6 rounded bg-foreground text-background text-[10px] font-medium flex items-center justify-center gap-1">
                  <Rocket className="h-3 w-3" /> Deploy
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <motion.div
          className="flex items-center justify-between px-3 py-1 bg-muted/30 border-t text-[9px] text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.6 }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Westend Asset Hub
          </div>
          <div className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 text-[8px] font-medium">PVM</div>
          <div className="flex items-center gap-1">
            <Check className="h-2.5 w-2.5 text-green-500" />
            Compiled
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// --- Feature Card Illustrations ---

function DualCompilerIllustration() {
  return (
    <div className="relative h-[180px] overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/50 p-4 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {/* EVM side */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-500">EVM</span>
          </div>
          <motion.div
            className="flex flex-col gap-0.5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="h-1 rounded-full bg-blue-500/20" style={{ width: `${32 - i * 8}px` }} />
            ))}
          </motion.div>
        </motion.div>

        {/* Toggle */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <ToggleRight className="h-6 w-6 text-purple-500" />
          <span className="text-[8px] text-muted-foreground">toggle</span>
        </motion.div>

        {/* PVM side */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-16 h-16 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-purple-500">PVM</span>
          </div>
          <motion.div
            className="flex flex-col gap-0.5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="h-1 rounded-full bg-purple-500/20" style={{ width: `${32 - i * 8}px` }} />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Source label */}
      <motion.div
        className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        Same Solidity source
      </motion.div>
    </div>
  );
}

function OpenZeppelinIllustration() {
  const packages = [
    { name: "AccessControl", delay: 0.3 },
    { name: "ReentrancyGuard", delay: 0.5 },
    { name: "Pausable", delay: 0.7 },
  ];

  return (
    <div className="relative h-[180px] overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/50 p-4">
      {/* Import line */}
      <motion.div
        className="font-mono text-[10px] text-yellow-500 mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        import &quot;@openzeppelin/...&quot;
      </motion.div>

      {/* Package blocks flowing in */}
      <div className="flex flex-col gap-2">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.name}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: pkg.delay, type: "spring", stiffness: 100 }}
          >
            <motion.div
              className="h-1 flex-1 rounded-full bg-gradient-to-r from-yellow-500/30 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: pkg.delay + 0.1 }}
              style={{ transformOrigin: "right" }}
            />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-card text-[10px] font-medium shrink-0">
              <Package className="h-3 w-3 text-yellow-500" />
              {pkg.name}
            </div>
          </motion.div>
        ))}
      </div>

      {/* npm cloud label */}
      <motion.div
        className="absolute bottom-3 right-3 text-[8px] text-muted-foreground/60 flex items-center gap-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9 }}
      >
        <Upload className="h-2.5 w-2.5" />
        resolved from npm
      </motion.div>
    </div>
  );
}

function NativeDeployIllustration() {
  const wallets = [
    { name: "Talisman", angle: 0, color: "text-red-400" },
    { name: "SubWallet", angle: 120, color: "text-green-400" },
    { name: "PolkadotJS", angle: 240, color: "text-purple-400" },
  ];

  return (
    <div className="relative h-[180px] overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
      {/* Center block icon */}
      <motion.div
        className="relative z-10 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <Rocket className="h-5 w-5 text-purple-500" />
      </motion.div>

      {/* Orbiting wallets */}
      {wallets.map((w, i) => {
        const radius = 60;
        const angleRad = (w.angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        return (
          <motion.div
            key={w.name}
            className="absolute flex flex-col items-center gap-0.5"
            style={{ left: `calc(50% + ${x}px - 20px)`, top: `calc(50% + ${y}px - 16px)` }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.15, type: "spring" }}
          >
            <div className={`w-8 h-8 rounded-lg bg-card border flex items-center justify-center`}>
              <Wallet className={`h-4 w-4 ${w.color}`} />
            </div>
            <span className="text-[7px] text-muted-foreground">{w.name}</span>
          </motion.div>
        );
      })}

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {wallets.map((w, i) => {
          const angleRad = (w.angle * Math.PI) / 180;
          const x = 50 + Math.cos(angleRad) * 20;
          const y = 50 + Math.sin(angleRad) * 20;
          return (
            <motion.line
              key={i}
              x1="50" y1="50" x2={x} y2={y}
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-muted-foreground/20"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.1 }}
            />
          );
        })}
      </svg>

    </div>
  );
}

// --- Feature Cards ---

const features = [
  {
    title: "Dual Compiler",
    description: "Toggle between EVM and PVM with one click. Same Solidity source, two compilation targets, zero context switching.",
    illustration: <DualCompilerIllustration />,
  },
  {
    title: "OpenZeppelin Ready",
    description: "Import @openzeppelin/contracts and it just works. Dependencies resolved from npm at compile time, no local toolchain.",
    illustration: <OpenZeppelinIllustration />,
  },
  {
    title: "Native Deploy",
    description: "Sign with Talisman or SubWallet. Deploy via substrate extrinsics, not MetaMask. Gas estimation from live chain dry-runs.",
    illustration: <NativeDeployIllustration />,
  },
];

// --- Main Section ---

export function ContractStudioSection() {
  return (
    <section className="relative overflow-hidden bg-muted/50 py-24 sm:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/80 px-4 py-1.5 text-sm text-muted-foreground mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            New on Polkadot Hub
          </motion.div>

          <motion.h2
            className="text-3xl font-heading font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Write, Compile, Deploy - All in Your Browser
          </motion.h2>

          <motion.p
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            The first native smart contract IDE for Polkadot Hub. Write Solidity, compile to
            PolkaVM, and deploy with Polkadot wallets - no CLI, no MetaMask, no fragmented toolchain.
          </motion.p>
        </div>

        {/* Studio Mockup */}
        <div className="mb-12">
          <StudioMockup />
        </div>

        {/* CTA below mockup */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button asChild size="lg" className="rounded-full text-base px-8">
            <Link href="/studio">
              Open Studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Feature Cards Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-heading font-bold tracking-tight sm:text-3xl mb-3">
            Designed for Polkadot from Day One
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every part of Studio understands substrate extrinsics, Polkadot wallets, and the PolkaVM compilation target.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="rounded-xl border bg-card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              {feature.illustration}
              <div className="p-5">
                <h3 className="font-heading font-semibold text-lg mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
