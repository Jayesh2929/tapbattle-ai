"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Tap } from "@/lib/analytics";

export function FatigueTrendChart({ taps, name }: { taps: Tap[]; name: string }) {
  const valid = taps.filter((t) => !t.falseStart).sort((a, b) => a.round - b.round);
  const windowSize = Math.max(1, Math.floor(valid.length / 4));

  const data = valid.map((t, i) => {
    const windowStart = Math.max(0, i - windowSize + 1);
    const windowVals = valid.slice(windowStart, i + 1).map((v) => v.reactionMs);
    const rollingAvg = windowVals.reduce((a, b) => a + b, 0) / windowVals.length;
    return { round: `R${t.round}`, reaction: Math.round(t.reactionMs), rollingAvg: Math.round(rollingAvg) };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fatigue trend</CardTitle>
        <CardDescription>{name}'s rolling average reaction time across the session</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -10, right: 10 }}>
            <defs>
              <linearGradient id="fatigueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="rollingAvg"
              stroke="#f472b6"
              strokeWidth={2.5}
              fill="url(#fatigueGradient)"
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
