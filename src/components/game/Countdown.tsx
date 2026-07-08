"use client";

import { AnimatePresence, motion } from "framer-motion";

export function Countdown({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white/[0.03]">
        <span className="absolute inset-0 rounded-full border border-violet-500/30 animate-pulse-ring" />
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.35 }}
            className="gradient-text font-display text-7xl font-bold"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
