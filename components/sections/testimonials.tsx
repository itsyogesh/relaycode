"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInterval } from "@/hooks/use-interval";
import { cn } from "@/lib/utils";
import Balancer from "react-wrap-balancer";

const testimonials = [
  {
    quote:
      "Relaycode reduced our failed transactions by 80% - finally a builder that speaks human *and* chain.",
    author: "Lead Developer",
    company: "Coong",
  },
  {
    quote:
      "Debugging encoded extrinsics just got 10x faster with Relaycode's dual-view interface.",
    author: "Software Engineer",
    company: "Decentration",
  },
];

const logos = [
  {
    src: "https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
    alt: "Google",
    className: "h-8",
  },
  {
    src: "https://cdn.brandfetch.io/idwDWo4ONQ/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
    alt: "Coinbase",
    className: "h-6",
  },
  {
    src: "https://cdn.brandfetch.io/id-pjrLx_q/theme/dark/idKzmFfrAl.svg?c=1dxbfHSJFAPEGdCLU4o5B",
    alt: "Binance",
    className: "h-6",
  },
  {
    src: "https://cdn.brandfetch.io/idchmboHEZ/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
    alt: "Microsoft",
    className: "h-6",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-advance testimonials every 5 seconds
  useInterval(
    () => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    },
    isPaused ? null : 5000
  );

  return (
    <section className="relative overflow-hidden bg-muted/50 py-24 sm:py-32">
      {/* Radial Gradient Background - Moved outside testimonial block */}
      <div
        className="absolute inset-0 opacity-[0.10] transition-[background] duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentIndex === 0 ? "#FF2670" : "#7916F3"} 0%, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted By Builders
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              <Balancer>
                See what developers are saying about their experience with
                Relaycode
              </Balancer>
            </p>
          </motion.div>

          {/* Testimonials Carousel */}
          <div
            className="mt-16 h-[200px] relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4"
              >
                <blockquote className="max-w-2xl text-xl font-medium leading-relaxed tracking-tight">
                  <Balancer>{testimonials[currentIndex].quote}</Balancer>
                </blockquote>
                <div className="mt-6 flex items-center gap-x-2 text-sm">
                  <span className="text-muted-foreground">
                    {testimonials[currentIndex].author}
                  </span>
                  <span className="text-muted-foreground/50">&middot;</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF2670] to-[#7916F3] font-medium">
                    {testimonials[currentIndex].company}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-6 bg-gradient-to-r from-[#FF2670] to-[#7916F3]"
                      : "w-1.5 bg-primary/20"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-24"
          >
            <p className="text-sm text-muted-foreground mb-6">
              Used by teams at
            </p>
            <div className="flex justify-center gap-x-12 grayscale opacity-50">
              {logos.map((logo) => (
                <img
                  key={logo.alt}
                  src={logo.src || "/placeholder.svg"}
                  alt={logo.alt}
                  className={logo.className}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
