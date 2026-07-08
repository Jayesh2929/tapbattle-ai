import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import type { AdminSessionRow } from "@/components/admin/SessionsTable";
import type { AdminPlayerRow } from "@/components/admin/PlayersDialog";
import type { AdminLogRow } from "@/components/admin/EventLog";

// Demo fallback shown only if the database isn't reachable (e.g. DATABASE_URL
// not configured yet), so the admin dashboard is still navigable.
const demoSessions: AdminSessionRow[] = [
  { code: "TB7K2Q", host: "Arnav", players: 4, status: "live", startedAgo: "2m ago" },
  { code: "TB9X3M", host: "Rushada", players: 2, status: "lobby", startedAgo: "just now" },
  { code: "TB2P8L", host: "Aditya", players: 5, status: "results", startedAgo: "14m ago" },
];

const demoPlayers: AdminPlayerRow[] = [
  { name: "Jayesh", sessionCode: "TB7K2Q", avgMs: 238, roundsPlayed: 3, joinedAgo: "2m ago", status: "connected" },
  { name: "Meera", sessionCode: "TB7K2Q", avgMs: 271, roundsPlayed: 3, joinedAgo: "2m ago", status: "connected" },
  { name: "Arnav", sessionCode: "TB2P8L", avgMs: 215, roundsPlayed: 5, joinedAgo: "14m ago", status: "disconnected" },
  { name: "Aditya", sessionCode: "TB2P8L", avgMs: 249, roundsPlayed: 5, joinedAgo: "14m ago", status: "disconnected" },
];

const demoLogs: AdminLogRow[] = [
  { level: "info", message: "Session TB7K2Q started round 3 of 5", time: "14:22:10" },
  { level: "info", message: "Player 'Jayesh' joined TB9X3M", time: "14:21:58" },
];

function mapStatus(status: string): "lobby" | "live" | "results" {
  if (status === "lobby") return "lobby";
  if (status === "results" || status === "closed") return "results";
  return "live"; // countdown | waiting | live all render as "live" in the admin table
}

export async function GET() {
  try {
    const sessions = await prisma.gameSession.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        players: { include: { taps: true } },
      },
    });

    const sessionRows: AdminSessionRow[] = sessions.map((s: (typeof sessions)[number]) => ({
      code: s.code,
      host: `Host-${s.hostId.slice(0, 5)}`,
      players: s.players.length,
      status: mapStatus(s.status),
      startedAgo: timeAgo(s.startedAt ?? s.createdAt),
    }));

    const playerRows: AdminPlayerRow[] = sessions.flatMap((s: (typeof sessions)[number]) =>
      s.players.map((p: (typeof s.players)[number]) => {
        const validTaps = p.taps.filter((t: (typeof p.taps)[number]) => !t.falseStart);
        const avgMs = validTaps.length
          ? Math.round(validTaps.reduce((acc: number, t: (typeof validTaps)[number]) => acc + t.reactionMs, 0) / validTaps.length)
          : 0;
        return {
          name: p.name,
          sessionCode: s.code,
          avgMs,
          roundsPlayed: p.taps.length,
          joinedAgo: timeAgo(p.joinedAt),
          status: (s.status === "results" || s.status === "closed" ? "disconnected" : "connected") as
            | "connected"
            | "disconnected",
        };
      })
    );

    const logs = await prisma.eventLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    const logRows: AdminLogRow[] = logs.map((l: (typeof logs)[number]) => ({
      level: l.level as "info" | "warn" | "error",
      message: l.message,
      time: new Date(l.createdAt).toLocaleTimeString(),
    }));

    return NextResponse.json({
      live: true,
      sessions: sessionRows,
      players: playerRows,
      logs: logRows,
    });
  } catch (e) {
    return NextResponse.json({
      live: false,
      error: (e as Error).message,
      sessions: demoSessions,
      players: demoPlayers,
      logs: demoLogs,
    });
  }
}
