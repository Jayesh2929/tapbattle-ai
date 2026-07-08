"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/game/Countdown";
import { TapButton } from "@/components/game/TapButton";
import { Leaderboard } from "@/components/game/Leaderboard";
import { WinnerAnimation } from "@/components/game/WinnerAnimation";
import { getSocket } from "@/lib/socket";
import type { GameSession, LeaderboardEntry, Player, RoundResult, SessionStatus } from "@/types";

export default function GameScreenPage() {
  const params = useParams<{ sessionId: string }>();
  const search = useSearchParams();
  const code = params.sessionId.toUpperCase();
  const name = search.get("name") ?? "Player";

  const [status, setStatus] = useState<SessionStatus>("lobby");
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ reactionMs: number; falseStart: boolean } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winner, setWinner] = useState<LeaderboardEntry | null>(null);
  const [hasTappedThisRound, setHasTappedThisRound] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    // Ensure this browser tab is registered in the room (idempotent join if
    // arriving here directly, e.g. after a refresh).
    socket.emit("session:join", { code, name });

    const onSelf = (p: Player) => setSelfId(p.id);
    const onSession = (s: GameSession) => {
      setStatus(s.status);
      setRound(s.round);
      setTotalRounds(s.totalRounds);
      if (s.status === "countdown") setHasTappedThisRound(false);
      if (s.status !== "countdown" && s.status !== "waiting") setCountdown(null);
    };
    const onCountdown = (s: number) => setCountdown(s);
    const onSignal = () => setCountdown(null);
    const onResult = (r: RoundResult) => {
      if (r.playerId === selfId) {
        setLastResult({ reactionMs: r.reactionMs, falseStart: r.falseStart });
      }
    };
    const onLeaderboard = (entries: LeaderboardEntry[]) => setLeaderboard(entries);
    const onWinner = (w: LeaderboardEntry) => setWinner(w);

    socket.on("player:self", onSelf);
    socket.on("session:update", onSession);
    socket.on("round:countdown", onCountdown);
    socket.on("round:signal", onSignal);
    socket.on("round:result", onResult);
    socket.on("leaderboard:update", onLeaderboard);
    socket.on("game:winner", onWinner);

    return () => {
      socket.off("player:self", onSelf);
      socket.off("session:update", onSession);
      socket.off("round:countdown", onCountdown);
      socket.off("round:signal", onSignal);
      socket.off("round:result", onResult);
      socket.off("leaderboard:update", onLeaderboard);
      socket.off("game:winner", onWinner);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, name, selfId]);

  function handleTap() {
    if (!selfId || hasTappedThisRound) return;
    if (status === "waiting") {
      // Tapped too early
      getSocket().emit("round:tap", { code, playerId: selfId, timestampMs: Date.now() });
      setHasTappedThisRound(true);
      return;
    }
    if (status === "live") {
      getSocket().emit("round:tap", { code, playerId: selfId, timestampMs: Date.now() });
      setHasTappedThisRound(true);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-10">
      <WinnerAnimation winner={winner} />
      <div className="mb-8 flex w-full max-w-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Exit
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {code}
          </Badge>
          <Badge variant="blue">
            Round {Math.min(round, totalRounds)} / {totalRounds}
          </Badge>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-10 py-6">
        {status === "countdown" && <Countdown value={countdown} />}

        {(status === "waiting" || status === "live") && (
          <TapButton status={status} onTap={handleTap} disabled={hasTappedThisRound} lastResult={lastResult} />
        )}

        {status === "lobby" && (
          <p className="text-center text-muted-foreground">Waiting for the host to start the game…</p>
        )}

        {status === "results" && (
          <p className="text-center text-muted-foreground">Session complete — check the analytics dashboard.</p>
        )}
      </div>

      <div className="w-full max-w-2xl">
        <Leaderboard entries={leaderboard} />
      </div>
    </main>
  );
}
