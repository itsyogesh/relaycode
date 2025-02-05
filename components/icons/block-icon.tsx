"use client"

import { motion } from "framer-motion"
import { Blocks } from "lucide-react"

export function BlockIcon({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    >
      <Blocks className="h-6 w-6 text-primary/40" />
    </motion.div>
  )
}

