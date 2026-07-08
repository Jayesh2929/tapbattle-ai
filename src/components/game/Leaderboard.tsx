"use client";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { colorForIndex, formatMs } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

const medalColors = ["text-amber-300", "text-slate-300", "text-orange-400"];

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-300" />
          Live leaderboard
        </CardTitle>
        <CardDescription>Ranked by total points across all rounds</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Scores will appear after the first round.</p>
        ) : (
          <LayoutGroup>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {entries.map((e) => (
                  <motion.div
                    layout
                    key={e.playerId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ layout: { duration: 0.5, ease: "easeInOut" } }}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <span
                      className={`w-6 shrink-0 text-center font-mono text-sm font-semibold ${
                        medalColors[e.rank - 1] ?? "text-muted-foreground"
                      }`}
                    >
                      {e.rank}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${colorForIndex(
                        e.avatarIndex
                      )}`}
                    >
                      {e.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">{e.name}</span>
                    <span className="text-xs text-muted-foreground">
                      best {e.bestMs ? formatMs(e.bestMs) : "—"}
                    </span>
                    <span className="w-16 shrink-0 text-right font-mono text-sm gradient-text">
                      {e.totalPoints} pts
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        )}
      </CardContent>
    </Card>
  );
}
