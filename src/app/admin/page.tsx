"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Server, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/analytics/StatCard";
import { SessionsTable, type AdminSessionRow } from "@/components/admin/SessionsTable";
import { EventLog, type AdminLogRow } from "@/components/admin/EventLog";

/**
 * In production this page subscribes to a lightweight `admin` Socket.io
 * namespace broadcasting room snapshots from server/index.ts. Here it
 * renders representative live-feeling demo data so the dashboard is fully
 * navigable without a running multi-session server.
 */
const demoSessions: AdminSessionRow[] = [
  { code: "TB7K2Q", host: "Arnav", players: 4, status: "live", startedAgo: "2m ago" },
  { code: "TB9X3M", host: "Rushada", players: 2, status: "lobby", startedAgo: "just now" },
  { code: "TB2P8L", host: "Aditya", players: 5, status: "results", startedAgo: "14m ago" },
];

const initialLogs: AdminLogRow[] = [
  { level: "info", message: "Session TB7K2Q started round 3 of 5", time: "14:22:10" },
  { level: "info", message: "Player 'Jayesh' joined TB9X3M", time: "14:21:58" },
  { level: "warn", message: "High latency (312ms) on socket #a91f for session TB2P8L", time: "14:20:41" },
  { level: "info", message: "Session TB2P8L completed — analytics persisted", time: "14:08:02" },
  { level: "error", message: "Prisma write retried for TB2P8L analytics snapshot", time: "14:08:01" },
];

export default function AdminDashboardPage() {
  const [latency, setLatency] = useState(48);
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(() => Math.round(35 + Math.random() * 40));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const totalPlayers = demoSessions.reduce((a, s) => a + s.players, 0);
  const liveSessions = demoSessions.filter((s) => s.status === "live").length;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Badge variant="success">All systems operational</Badge>
        </div>

        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
            <Server className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">Server health &amp; session oversight</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Zap} label="Active sessions" value={String(demoSessions.length)} sublabel={`${liveSessions} in progress`} />
          <StatCard icon={Users} label="Connected players" value={String(totalPlayers)} sublabel="Across all sessions" delay={0.05} tone="success" />
          <StatCard icon={Activity} label="Average latency" value={`${latency}ms`} sublabel="Round-trip socket ping" delay={0.1} tone={latency > 70 ? "warning" : "default"} />
          <StatCard icon={Server} label="Server status" value="Healthy" sublabel="Node + Socket.io + PostgreSQL" delay={0.15} tone="success" />
        </div>

        <div className="mb-6">
          <SessionsTable sessions={demoSessions} />
        </div>

        <EventLog logs={logs} />
      </div>
    </main>
  );
}
