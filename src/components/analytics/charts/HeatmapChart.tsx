"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Tap } from "@/lib/analytics";

/** Maps a reaction time to a color on a fast (violet) -> slow (rose) scale. */
function colorFor(ms: number, min: number, max: number) {
  if (max === min) return "rgba(139,92,246,0.6)";
  const t = Math.min(1, Math.max(0, (ms - min) / (max - min)));
  const r = Math.round(139 + t * (244 - 139));
  const g = Math.round(92 + t * (63 - 92));
  const b = Math.round(246 + t * (94 - 246));
  return `rgba(${r},${g},${b},0.85)`;
}

export function HeatmapChart({ players }: { players: { name: string; taps: Tap[] }[] }) {
  const rounds = Math.max(...players.map((p) => p.taps.length), 0);
  const allValid = players.flatMap((p) => p.taps.filter((t) => !t.falseStart).map((t) => t.reactionMs));
  const min = allValid.length ? Math.min(...allValid) : 0;
  const max = allValid.length ? Math.max(...allValid) : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reaction heatmap</CardTitle>
        <CardDescription>Speed intensity per round — cooler tones are faster</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="mb-2 grid" style={{ gridTemplateColumns: `100px repeat(${rounds}, minmax(28px, 1fr))` }}>
            <span />
            {Array.from({ length: rounds }).map((_, i) => (
              <span key={i} className="text-center text-[10px] text-muted-foreground">
                R{i + 1}
              </span>
            ))}
          </div>
          {players.map((p, pi) => (
            <div
              key={p.name}
              className="mb-1.5 grid items-center gap-1"
              style={{ gridTemplateColumns: `100px repeat(${rounds}, minmax(28px, 1fr))` }}
            >
              <span className="truncate text-xs text-muted-foreground">{p.name}</span>
              {Array.from({ length: rounds }).map((_, ri) => {
                const t = p.taps[ri];
                const falseStart = t?.falseStart;
                return (
                  <motion.div
                    key={ri}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: (pi * rounds + ri) * 0.01 }}
                    className="h-6 rounded-md"
                    style={{
                      backgroundColor: falseStart
                        ? "rgba(239,68,68,0.35)"
                        : t
                        ? colorFor(t.reactionMs, min, max)
                        : "rgba(255,255,255,0.04)",
                    }}
                    title={t ? (falseStart ? "False start" : `${Math.round(t.reactionMs)}ms`) : "No data"}
                  />
                );
              })}
            </div>
          ))}
          <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "rgba(139,92,246,0.85)" }} /> fastest
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "rgba(244,63,94,0.85)" }} /> slowest
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500/35" /> false start
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
