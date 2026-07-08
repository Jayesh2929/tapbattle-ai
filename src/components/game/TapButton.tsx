"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/types";

interface TapButtonProps {
  status: SessionStatus;
  onTap: () => void;
  disabled?: boolean;
  lastResult?: { reactionMs: number; falseStart: boolean } | null;
}

export function TapButton({ status, onTap, disabled, lastResult }: TapButtonProps) {
  const isLive = status === "live";
  const isWaiting = status === "waiting";

  const label = isLive
    ? "TAP NOW!"
    : isWaiting
    ? "Wait for it…"
    : status === "countdown"
    ? "Get ready…"
    : "Waiting for host";

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.button
        onClick={onTap}
        disabled={disabled || (!isLive && !isWaiting)}
        whileTap={{ scale: 0.94 }}
        animate={
          isLive
            ? { scale: [1, 1.03, 1] }
            : { scale: 1 }
        }
        transition={isLive ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
        className={cn(
          "flex h-56 w-56 select-none items-center justify-center rounded-full text-xl font-bold uppercase tracking-wide shadow-2xl transition-colors duration-200 sm:h-64 sm:w-64",
          isLive
            ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-black shadow-emerald-500/40"
            : isWaiting
            ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-red-900/40"
            : "bg-white/[0.06] text-muted-foreground",
          "disabled:cursor-not-allowed"
        )}
      >
        {label}
      </motion.button>

      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {lastResult.falseStart ? (
            <p className="font-medium text-red-400">Too early — false start</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your reaction: <span className="gradient-text font-semibold">{Math.round(lastResult.reactionMs)}ms</span>
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
