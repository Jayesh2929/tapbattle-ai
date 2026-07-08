"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X } from "lucide-react";
import { colorForIndex } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

const confettiColors = ["#8b5cf6", "#3b82f6", "#f472b6", "#34d399", "#fbbf24"];

export function WinnerAnimation({
  winner,
  onDismiss,
}: {
  winner: LeaderboardEntry | null;
  onDismiss?: () => void;
}) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        color: confettiColors[i % confettiColors.length],
        rotate: Math.random() * 360,
        size: 6 + Math.random() * 6,
      })),
    []
  );

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {confetti.map((c) => (
              <motion.span
                key={c.id}
                className="absolute top-0 rounded-sm"
                style={{ left: `${c.x}%`, width: c.size, height: c.size * 0.4, backgroundColor: c.color }}
                initial={{ y: -40, opacity: 1, rotate: 0 }}
                animate={{ y: "110vh", opacity: [1, 1, 0], rotate: c.rotate }}
                transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="glass relative z-10 flex flex-col items-center gap-4 px-12 py-10 text-center"
          >
            {onDismiss && (
              <button
                onClick={onDismiss}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1 }}
            >
              <Crown className="h-12 w-12 text-amber-300" />
            </motion.div>
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white ${colorForIndex(
                winner.avatarIndex
              )}`}
            >
              {winner.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="font-display text-2xl font-semibold">{winner.name} wins!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {winner.totalPoints} points · best reaction {winner.bestMs}ms
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="btn-gradient mt-2 rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-all"
              >
                Continue
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
