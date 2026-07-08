"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PlayerAnalytics } from "@/lib/analytics";

function scoreColor(score: number) {
  if (score >= 80) return "#34d399";
  if (score >= 55) return "#60a5fa";
  if (score >= 35) return "#f59e0b";
  return "#f87171";
}

export function ConsistencyGraph({ players }: { players: PlayerAnalytics[] }) {
  const data = players
    .map((p) => ({ name: p.name, score: p.consistencyScore }))
    .sort((a, b) => b.score - a.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consistency graph</CardTitle>
        <CardDescription>0–100 score derived from reaction-time variance</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} width={70} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#12121c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="score" radius={[0, 8, 8, 0]} animationDuration={900}>
              {data.map((d, i) => (
                <Cell key={i} fill={scoreColor(d.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
