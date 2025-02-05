"use client"

import { motion } from "framer-motion"

interface StepProps {
  number: number
  title: string
  description: string
}

const Step = ({ number, title, description }: StepProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative flex-1"
  >
    <div className="flex flex-col items-center">
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold"
      >
        {number}
        <div className="absolute -inset-1 animate-pulse rounded-full bg-primary/5" />
      </motion.div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">{description}</p>
    </div>
  </motion.div>
)

const ConnectingLine = () => (
  <div className="relative flex-1 py-4">
    <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/10" />
    <motion.div
      className="absolute left-0 right-0 top-1/2 h-px bg-primary/30"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeInOut" }}
      style={{ transformOrigin: "left" }}
    />
  </div>
)

export function ConnectedSteps({ steps }: { steps: StepProps[] }) {
  return (
    <div className="flex items-start gap-4">
      {steps.map((step, index) => (
        <>
          <Step key={step.title} {...step} />
          {index < steps.length - 1 && <ConnectingLine />}
        </>
      ))}
    </div>
  )
}

