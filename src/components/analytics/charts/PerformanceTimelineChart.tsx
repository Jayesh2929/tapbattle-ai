"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Tap, TrendResult } from "@/lib/analytics";

export function PerformanceTimelineChart({
  taps,
  trend,
  name,
}: {
  taps: Tap[];
  trend: TrendResult;
  name: string;
}) {
  const valid = taps.filter((t) => !t.falseStart).sort((a, b) => a.round - b.round);
  const intercept =
    valid.length > 0 ? valid[0].reactionMs - trend.slopeMsPerRound * valid[0].round : 0;

  const data = valid.map((t) => ({
    round: t.round,
    reaction: Math.round(t.reactionMs),
    fitted: Math.round(trend.slopeMsPerRound * t.round + intercept),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance timeline</CardTitle>
        <CardDescription>
          {name}'s taps with AI trend line ({trend.direction}, predicted next {Math.round(trend.predictedNextMs)}ms)
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: -10, right: 10 }}>
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
            <Scatter dataKey="reaction" fill="#60a5fa" animationDuration={900} />
            <Line
              type="linear"
              dataKey="fitted"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
