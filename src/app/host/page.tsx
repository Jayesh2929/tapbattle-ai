"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { motion } from "framer-motion";
import { ArrowLeft, LineChart, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QRDisplay } from "@/components/host/QRDisplay";
import { PlayerList } from "@/components/host/PlayerList";
import { LiveActivity } from "@/components/host/LiveActivity";
import { Leaderboard } from "@/components/game/Leaderboard";
import { WinnerAnimation } from "@/components/game/WinnerAnimation";
import { getSocket } from "@/lib/socket";
import type { GameSession, LeaderboardEntry, Player } from "@/types";

export default function HostDashboardPage() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winner, setWinner] = useState<LeaderboardEntry | null>(null);
  const hostId = useMemo(() => uuid(), []);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("session:create", hostId);

    socket.on("session:update", setSession);
    socket.on("players:update", setPlayers);
    socket.on("leaderboard:update", setLeaderboard);
    socket.on("activity:log", (msg) => setLogs((l) => [...l, msg]));
    socket.on("game:winner", (w) => setWinner(w));

    return () => {
      socket.off("session:update", setSession);
      socket.off("players:update", setPlayers);
      socket.off("leaderboard:update", setLeaderboard);
      socket.off("activity:log");
      socket.off("game:winner");
    };
  }, [hostId]);

  const joinUrl = session
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${session.code}`
    : "";

  function handleStart() {
    if (!session) return;
    socket_start(session.code);
  }
  function socket_start(code: string) {
    getSocket().emit("session:start", code);
  }

  const isLive = session && session.status !== "lobby" && session.status !== "closed";

  return (
    <main className="min-h-screen px-6 py-10">
      <WinnerAnimation winner={winner} />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            {session && (
              <Badge variant={isLive ? "success" : "outline"} className="capitalize">
                {session.status}
              </Badge>
            )}
            {session && (
              <Link href={`/analytics/${session.code}`}>
                <Button variant="secondary" size="sm">
                  <LineChart className="h-4 w-4" /> Analytics
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
            <Zap className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Host dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your live TapBattle session</p>
          </div>
        </div>

        {!session ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Skeleton className="h-72 md:col-span-1" />
            <Skeleton className="h-72 md:col-span-2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <QRDisplay code={session.code} joinUrl={joinUrl} />
            </div>
            <div className="flex flex-col gap-6 md:col-span-2">
              <PlayerList players={players} />
              {isLive ? <Leaderboard entries={leaderboard} /> : <LiveActivity logs={logs} />}
            </div>
          </div>
        )}

        {session && session.status === "lobby" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <Button size="lg" onClick={handleStart} disabled={players.length === 0}>
              <Play className="h-4 w-4" />
              Start game
            </Button>
          </motion.div>
        )}

        {session && session.status !== "lobby" && (
          <div className="mt-6">
            <LiveActivity logs={logs} />
          </div>
        )}
      </div>
    </main>
  );
}
