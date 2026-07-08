"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { colorForIndex, formatMs } from "@/lib/utils";
import type { PlayerAnalytics } from "@/lib/analytics";

const classTone: Record<string, "success" | "default" | "warning" | "destructive" | "blue"> = {
  "Elite Reflexes": "success",
  "Sharp & Consistent": "blue",
  "Solid Competitor": "default",
  Developing: "warning",
  "Needs Warm-up": "destructive",
};

export function PlayerRanking({ players }: { players: PlayerAnalytics[] }) {
  const ranked = [...players].sort((a, b) => a.averageMs - b.averageMs);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-300" />
          Player ranking
        </CardTitle>
        <CardDescription>Ordered by average reaction time, with AI classification</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ranked.map((p, i) => (
          <motion.div
            key={p.playerId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-center font-mono text-sm text-muted-foreground">{i + 1}</span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${colorForIndex(
                  i
                )}`}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  avg {formatMs(p.averageMs)} · best {formatMs(p.fastestMs)} · accuracy {p.accuracy}%
                </p>
              </div>
              <Badge variant={classTone[p.classification] ?? "default"}>{p.classification}</Badge>
            </div>
            {p.suggestions.length > 0 && (
              <p className="mt-3 border-t border-white/5 pt-3 text-xs text-muted-foreground">
                {p.suggestions[0]}
              </p>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
