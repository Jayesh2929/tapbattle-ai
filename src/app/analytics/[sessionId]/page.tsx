"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Gauge,
  Percent,
  Repeat,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/analytics/StatCard";
import { PlayerRanking } from "@/components/analytics/PlayerRanking";
import { ReactionTrendChart } from "@/components/analytics/charts/ReactionTrendChart";
import { SessionComparisonChart } from "@/components/analytics/charts/SessionComparisonChart";
import { HeatmapChart } from "@/components/analytics/charts/HeatmapChart";
import { ConsistencyGraph } from "@/components/analytics/charts/ConsistencyGraph";
import { FatigueTrendChart } from "@/components/analytics/charts/FatigueTrendChart";
import { PerformanceTimelineChart } from "@/components/analytics/charts/PerformanceTimelineChart";
import { generateDemoSession } from "@/lib/mockData";
import { formatMs } from "@/lib/utils";

export default function AnalyticsDashboardPage() {
  const params = useParams<{ sessionId: string }>();
  const session = useMemo(() => generateDemoSession(12), []);
  const [focusPlayerIdx, setFocusPlayerIdx] = useState(0);

  const players = session.players.map((p) => p.analytics);
  const focusPlayer = session.players[focusPlayerIdx];

  const topAvg = [...players].sort((a, b) => a.averageMs - b.averageMs)[0];
  const fastestOverall = Math.min(...players.map((p) => p.fastestMs));
  const avgConsistency = Math.round(players.reduce((a, p) => a + p.consistencyScore, 0) / players.length);
  const anyFatigue = players.some((p) => p.fatigue.detected);
  const avgAccuracy = Math.round(players.reduce((a, p) => a + p.accuracy, 0) / players.length);
  const bestStreak = Math.max(...players.map((p) => p.bestStreak));

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Badge variant="outline" className="font-mono">
            Session {params.sessionId?.toUpperCase()}
          </Badge>
        </div>

        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
            <Zap className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">AI analytics dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Reaction trend prediction, fatigue detection &amp; consistency scoring for this session
            </p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            icon={Timer}
            label="Average reaction time"
            value={formatMs(topAvg.averageMs)}
            sublabel={`${topAvg.name} · fastest average`}
            delay={0}
          />
          <StatCard icon={Zap} label="Fastest tap" value={`${fastestOverall}ms`} sublabel="Across all players" delay={0.05} tone="success" />
          <StatCard
            icon={Gauge}
            label="Consistency score"
            value={`${avgConsistency}/100`}
            sublabel="Session average"
            delay={0.1}
          />
          <StatCard
            icon={Flame}
            label="Fatigue detection"
            value={anyFatigue ? "Detected" : "None"}
            sublabel={anyFatigue ? "Slowdown found in later rounds" : "No significant slowdown"}
            tone={anyFatigue ? "warning" : "success"}
            delay={0.15}
          />
          <StatCard icon={Percent} label="Accuracy" value={`${avgAccuracy}%`} sublabel="Valid taps vs false starts" delay={0.2} />
          <StatCard icon={Repeat} label="Best streak" value={`${bestStreak} rounds`} sublabel="Sub-300ms consecutive taps" delay={0.25} />
          <StatCard
            icon={TrendingUp}
            label="Player ranking"
            value={`#1 ${topAvg.name}`}
            sublabel={topAvg.classification}
            delay={0.3}
            tone="default"
          />
        </div>

        {/* Player focus selector for single-player charts */}
        <div className="mb-4 flex flex-wrap gap-2">
          {session.players.map((p, i) => (
            <button
              key={p.analytics.playerId}
              onClick={() => setFocusPlayerIdx(i)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                i === focusPlayerIdx
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                  : "border-white/10 text-muted-foreground hover:bg-white/[0.05]"
              }`}
            >
              {p.analytics.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReactionTrendChart players={session.players.map((p) => ({ name: p.analytics.name, taps: p.taps }))} />
          <SessionComparisonChart players={players} />
          <ConsistencyGraph players={players} />
          <FatigueTrendChart taps={focusPlayer.taps} name={focusPlayer.analytics.name} />
          <PerformanceTimelineChart
            taps={focusPlayer.taps}
            trend={focusPlayer.analytics.trend}
            name={focusPlayer.analytics.name}
          />
          <div className="lg:col-span-2">
            <HeatmapChart players={session.players.map((p) => ({ name: p.analytics.name, taps: p.taps }))} />
          </div>
        </div>

        <div className="mt-6">
          <PlayerRanking players={players} />
        </div>
      </div>
    </main>
  );
}
