"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Tap } from "@/lib/analytics";

const lineColors = ["#a78bfa", "#60a5fa", "#f472b6", "#34d399"];

export function ReactionTrendChart({ players }: { players: { name: string; taps: Tap[] }[] }) {
  const rounds = Math.max(...players.map((p) => p.taps.length), 0);
  const data = Array.from({ length: rounds }).map((_, i) => {
    const row: Record<string, number | string> = { round: `R${i + 1}` };
    players.forEach((p) => {
      const t = p.taps[i];
      row[p.name] = t && !t.falseStart ? Math.round(t.reactionMs) : NaN;
    });
    return row;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reaction trend</CardTitle>
        <CardDescription>Reaction time per round, all players</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="round" stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} unit="ms" />
            <Tooltip
              contentStyle={{
                background: "#12121c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            {players.map((p, i) => (
              <Line
                key={p.name}
                type="monotone"
                dataKey={p.name}
                stroke={lineColors[i % lineColors.length]}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
                isAnimationActive
                animationDuration={900}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
