"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Server, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/analytics/StatCard";
import { SessionsTable, type AdminSessionRow } from "@/components/admin/SessionsTable";
import { EventLog, type AdminLogRow } from "@/components/admin/EventLog";
import { PlayersDialog, type AdminPlayerRow } from "@/components/admin/PlayersDialog";

const POLL_INTERVAL_MS = 4000;

export default function AdminDashboardPage() {
  const [sessions, setSessions] = useState<AdminSessionRow[]>([]);
  const [players, setPlayers] = useState<AdminPlayerRow[]>([]);
  const [logs, setLogs] = useState<AdminLogRow[]>([]);
  const [latency, setLatency] = useState(48);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [playersDialogOpen, setPlayersDialogOpen] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    const start = performance.now();
    try {
      const res = await fetch("/api/admin/overview").then((r) => r.json());
      setSessions(res.sessions ?? []);
      setPlayers(res.players ?? []);
      setLogs(res.logs ?? []);
      setIsLive(res.live ?? false);
      setDbError(res.error ?? null);
      setLatency(Math.round(performance.now() - start));
    } catch {
      setDbError("Could not reach the admin API.");
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  const totalPlayers = players.length;
  const liveSessionsCount = sessions.filter((s) => s.status === "live").length;

  function openAllPlayers() {
    setSessionFilter(null);
    setPlayersDialogOpen(true);
  }

  function openSessionPlayers(code: string) {
    setSessionFilter(code);
    setPlayersDialogOpen(true);
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Badge variant={isLive ? "success" : "warning"}>
            {isLive ? "All systems operational" : "Showing demo data — database unreachable"}
          </Badge>
        </div>

        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
            <Server className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {isLive
                ? `Live data from every session played — refreshes every ${POLL_INTERVAL_MS / 1000}s`
                : "Server health & session oversight"}
            </p>
          </div>
        </div>

        {dbError && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
            {dbError} Sessions still run fine in-memory, but history won&apos;t appear here until the database is reachable.
          </div>
        )}

        {loading ? (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Zap} label="Active sessions" value={String(sessions.length)} sublabel={`${liveSessionsCount} in progress`} />
            <button onClick={openAllPlayers} className="text-left transition-transform hover:-translate-y-0.5">
              <StatCard
                icon={Users}
                label="Connected players"
                value={String(totalPlayers)}
                sublabel="Click to view all players"
                delay={0.05}
                tone="success"
              />
            </button>
            <StatCard
              icon={Activity}
              label="Average latency"
              value={`${latency}ms`}
              sublabel="Admin API round-trip"
              delay={0.1}
              tone={latency > 400 ? "warning" : "default"}
            />
            <StatCard
              icon={Server}
              label="Server status"
              value={isLive ? "Healthy" : "Degraded"}
              sublabel="Node + Socket.io + PostgreSQL"
              delay={0.15}
              tone={isLive ? "success" : "warning"}
            />
          </div>
        )}

        <div className="mb-6">
          {loading ? (
            <Skeleton className="h-64" />
          ) : sessions.length === 0 ? (
            <div className="glass flex flex-col items-center gap-2 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No sessions yet — host a game to see it appear here in real time.
              </p>
            </div>
          ) : (
            <SessionsTable sessions={sessions} onRowClick={openSessionPlayers} />
          )}
        </div>

        {loading ? <Skeleton className="h-64" /> : <EventLog logs={logs} />}
      </div>

      <PlayersDialog
        open={playersDialogOpen}
        onOpenChange={setPlayersDialogOpen}
        players={players}
        sessionFilter={sessionFilter}
      />
    </main>
  );
}
