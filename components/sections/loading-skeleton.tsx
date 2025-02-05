"use client"

import { motion } from "framer-motion"

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px bg-muted/50 p-px">
      <div className="space-y-4 bg-background p-4">
        <motion.div
          className="h-8 w-full rounded-lg bg-muted/50"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />
        <div className="space-y-3">
          <motion.div
            className="h-12 w-full rounded-lg bg-muted/50"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
          />
          <motion.div
            className="h-12 w-full rounded-lg bg-muted/50"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
          />
          <motion.div
            className="h-24 w-full rounded-lg bg-muted/50"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
          />
        </div>
      </div>
      <div className="space-y-4 bg-background p-4">
        <motion.div
          className="h-8 w-full rounded-lg bg-muted/50"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />
        <div className="space-y-3">
          <motion.div
            className="h-12 w-full rounded-lg bg-muted/50"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
          />
          <motion.div
            className="h-12 w-full rounded-lg bg-muted/50"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
          />
          <motion.div
            className="h-36 w-full rounded-lg bg-muted/50"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
          />
        </div>
      </div>
    </div>
  )
}

