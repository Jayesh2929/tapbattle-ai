"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-28 md:pt-36">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-6 gap-1.5 py-1.5 pl-2 pr-3">
            <Zap className="h-3.5 w-3.5" />
            AI-driven reaction analytics, in real time
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          How fast is your
          <br />
          <span className="gradient-text bg-[length:200%_auto] animate-gradient">reflex, really?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-xl text-balance text-lg text-muted-foreground"
        >
          TapBattle AI is a browser-based multiplayer reaction game — QR-code onboarding,
          live leaderboards, and an AI engine that scores your consistency, spots fatigue,
          and predicts your next tap.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/host">
              Host a game
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/join">Join with a code</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 flex items-center gap-6 text-xs text-muted-foreground"
        >
          <span>Built for classrooms, teams &amp; live events</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>No install — scan and play</span>
        </motion.div>
      </div>
    </section>
  );
}
