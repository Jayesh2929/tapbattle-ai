"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PlayerAnalytics } from "@/lib/analytics";

const barColors = ["#8b5cf6", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"];

export function SessionComparisonChart({ players }: { players: PlayerAnalytics[] }) {
  const data = players.map((p) => ({ name: p.name, avg: p.averageMs, fastest: p.fastestMs }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session comparison</CardTitle>
        <CardDescription>Average reaction time by player</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} unit="ms" />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#12121c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="avg" radius={[8, 8, 0, 0]} animationDuration={900}>
              {data.map((_, i) => (
                <Cell key={i} fill={barColors[i % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
