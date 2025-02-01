"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Book, Shield } from "lucide-react"
import { useState, useEffect } from "react"

const features = [
  {
    icon: Zap,
    title: "Live Input Encoding",
    description: "Watch your inputs transform into chain-specific data in real-time",
    illustration: (
      <div className="h-[120px] w-full rounded-lg bg-gradient-to-r from-[#FF2670]/5 to-[#7916F3]/5 p-4">
        <div className="flex gap-4 h-full">
          <div className="flex-1 rounded-lg bg-background/50 p-2">
            <div className="h-4 w-3/4 bg-primary/10 rounded-md mb-2" />
            <div className="h-4 w-1/2 bg-primary/10 rounded-md" />
          </div>
          <div className="flex-1 rounded-lg bg-background/50 p-2">
            <div className="h-4 w-full bg-gradient-to-r from-[#FF2670]/20 to-[#7916F3]/20 rounded-md mb-2 animate-pulse" />
            <div className="h-4 w-2/3 bg-gradient-to-r from-[#FF2670]/20 to-[#7916F3]/20 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    ),
    gradient: "from-[#FF2670]/5 to-[#7916F3]/5",
    border: "from-[#FF2670]/20 to-[#7916F3]/20",
  },
  {
    icon: Book,
    title: "Contextual Guides",
    description: "No more pallet guessing or converting parameters again",
    illustration: (
      <div className="h-[120px] w-full rounded-lg bg-gradient-to-r from-[#7916F3]/5 to-[#FF2670]/5 p-4">
        <div className="relative h-full">
          <div className="absolute inset-0 flex flex-col gap-2">
            <div className="h-8 w-full rounded-lg bg-background/50 p-2 flex items-center">
              <div className="h-3 w-1/3 bg-primary/10 rounded-md" />
            </div>
            <div className="flex-1 rounded-lg bg-background/50 p-3">
              <div className="h-16 w-5/6 rounded-lg border border-primary/20 bg-background/80 p-2 shadow-lg">
                <div className="h-3 w-2/3 bg-primary/10 rounded-md mb-2" />
                <div className="h-3 w-1/2 bg-primary/10 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    gradient: "from-[#7916F3]/5 to-[#FF2670]/5",
    border: "from-[#7916F3]/20 to-[#FF2670]/20",
  },
  {
    icon: Shield,
    title: "Type-Safe Building Blocks",
    description: "Build your own forms and catch input failures for 100+ substrate primitives",
    illustration: (
      <div className="h-[120px] w-full rounded-lg bg-gradient-to-r from-[#FF2670]/5 to-[#7916F3]/5 p-4">
        <div className="grid grid-cols-3 gap-3 h-full">
          <div className="rounded-lg bg-background/50 p-2 flex flex-col items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <div className="h-4 w-4 rounded-full bg-green-500/20" />
            </div>
            <div className="h-2 w-2/3 bg-primary/10 rounded-md" />
          </div>
          <div className="rounded-lg bg-background/50 p-2 flex flex-col items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <div className="h-4 w-4 rounded-full bg-green-500/20" />
            </div>
            <div className="h-2 w-2/3 bg-primary/10 rounded-md" />
          </div>
          <div className="rounded-lg bg-background/50 p-2 flex flex-col items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <div className="h-4 w-4 rounded-full bg-green-500/20" />
            </div>
            <div className="h-2 w-2/3 bg-primary/10 rounded-md" />
          </div>
        </div>
      </div>
    ),
    gradient: "from-[#FF2670]/5 to-[#7916F3]/5",
    border: "from-[#FF2670]/20 to-[#7916F3]/20",
  },
]

const userTypes = ["Developers", "New Users", "Power Users", "Builders"]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const textVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  active: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
}

const gradientVariants = {
  initial: { opacity: 0.5 },
  hover: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
}

export function WhyDevelopers() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % userTypes.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const currentWord = userTypes[currentIndex]
  const maxWidth = Math.max(...userTypes.map((word) => word.length)) * 0.9 + "ch"

  return (
    <section className="overflow-hidden bg-muted/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center">
            <div className="relative inline-flex items-center">
              <div style={{ width: maxWidth }} className="inline-flex justify-center overflow-hidden h-[1.1em]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.span
                    key={currentWord}
                    variants={textVariants}
                    custom={direction}
                    initial="enter"
                    animate="active"
                    exit="exit"
                    transition={{
                      y: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute bg-clip-text text-transparent bg-gradient-to-r from-[#FF2670] to-[#7916F3]"
                  >
                    {currentWord}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="ml-1">💙 Relaycode</span>
              <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF2670] to-[#7916F3] opacity-10" />
            </div>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            We created Relaycode to solve our own issues around complex chain data and encoding in Polkadot. Our goal is
            to let users and developers focus on building instead of dealing with the intricacies of Polkadot.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-7xl grid grid-cols-1 gap-8 sm:mt-20 md:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card
                className={`
                relative overflow-hidden 
                bg-gradient-to-br ${feature.gradient}
                border-0 before:absolute before:inset-0 before:bg-gradient-to-br before:${feature.border} before:p-[1px] before:-m-[1px]
                transition-all duration-600 ease-in-out
                hover:shadow-lg hover:shadow-primary/5
                group
              `}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FF2670]/10 via-[#7916F3]/10 to-[#FF2670]/10 opacity-0 bg-[length:200%_auto] bg-clip-padding"
                  variants={gradientVariants}
                  initial="initial"
                  whileHover="hover"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    backgroundPosition: {
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                  }}
                />
                <CardContent className="relative z-10 p-8">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="mb-6 text-muted-foreground">{feature.description}</p>
                  {feature.illustration}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">Used by teams at</p>
          <div className="flex justify-center gap-x-12 grayscale opacity-50">
            <img
              className="h-8"
              src="https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B"
              alt="Google"
            />
            <img
              className="h-6"
              src="https://cdn.brandfetch.io/idwDWo4ONQ/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B"
              alt="Coinbase"
            />
            <img
              className="h-6"
              src="https://cdn.brandfetch.io/id-pjrLx_q/theme/dark/idKzmFfrAl.svg?c=1dxbfHSJFAPEGdCLU4o5B"
              alt="Binance"
            />
            <img
              className="h-6"
              src="https://cdn.brandfetch.io/idchmboHEZ/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B"
              alt="Microsoft"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

