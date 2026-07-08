import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { prisma } from "../src/lib/prisma";
import { generateSessionCode, randomBetween } from "../src/lib/utils";
import { analyzePlayer, type Tap as AnalyticsTap } from "../src/lib/analytics";
import type {
  ClientToServerEvents,
  GameSession,
  LeaderboardEntry,
  Player,
  RoundResult,
  ServerToClientEvents,
} from "../src/types";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

interface RoomState {
  session: GameSession;
  players: Map<string, Player>;
  taps: Map<string, AnalyticsTap[]>; // playerId -> taps
  signalTimestamp: number | null;
}

const rooms = new Map<string, RoomState>(); // keyed by session code

function toLeaderboard(room: RoomState): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  for (const player of room.players.values()) {
    const taps = room.taps.get(player.id) ?? [];
    const valid = taps.filter((t) => !t.falseStart);
    const bestMs = valid.length ? Math.min(...valid.map((t) => t.reactionMs)) : Infinity;
    const lastMs = taps.length ? taps[taps.length - 1].reactionMs : null;
    const totalPoints = valid.reduce((acc, t) => acc + Math.max(0, 1000 - t.reactionMs), 0);
    entries.push({
      playerId: player.id,
      name: player.name,
      avatarIndex: player.avatarIndex,
      bestMs: bestMs === Infinity ? 0 : Math.round(bestMs),
      lastMs: lastMs ? Math.round(lastMs) : null,
      totalPoints: Math.round(totalPoints),
      rank: 0,
    });
  }
  entries.sort((a, b) => b.totalPoints - a.totalPoints);
  entries.forEach((e, i) => (e.rank = i + 1));
  return entries;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    let currentCode: string | null = null;

    socket.on("session:create", async (hostId: string) => {
      const code = generateSessionCode();
      const session: GameSession = {
        id: uuid(),
        code,
        hostId,
        status: "lobby",
        round: 0,
        totalRounds: 5,
        createdAt: Date.now(),
      };
      rooms.set(code, { session, players: new Map(), taps: new Map(), signalTimestamp: null });
      currentCode = code;
      socket.join(code);
      socket.emit("session:update", session);

      try {
        await prisma.gameSession.create({
          data: { id: session.id, code, hostId, status: "lobby", totalRounds: 5 },
        });
      } catch (e) {
        // DB optional in local/demo mode — game still runs fully in-memory.
        console.warn("[db] could not persist session (continuing in-memory):", (e as Error).message);
      }
    });

    socket.on("session:join", async ({ code, name }) => {
      const room = rooms.get(code);
      if (!room) {
        socket.emit("activity:log", `No session found for code ${code}`);
        return;
      }
      currentCode = code;

      // Idempotency guard: if this socket already has a player registered
      // in this room (e.g. the join page joined, then the game screen
      // joined again on mount, or the tab was refreshed), just resend the
      // existing player's state instead of creating a duplicate.
      const existingPlayerId = socket.data.playerId as string | undefined;
      if (existingPlayerId && room.players.has(existingPlayerId)) {
        socket.join(code);
        socket.emit("session:update", room.session);
        socket.emit("player:self", room.players.get(existingPlayerId)!);
        return;
      }

      const player: Player = {
        id: uuid(),
        name: name.slice(0, 24) || "Player",
        joinedAt: Date.now(),
        connected: true,
        avatarIndex: room.players.size,
      };
      room.players.set(player.id, player);
      room.taps.set(player.id, []);
      socket.join(code);
      socket.data.playerId = player.id;

      io.to(code).emit("players:update", Array.from(room.players.values()));
      io.to(code).emit("activity:log", `${player.name} joined the session`);
      socket.emit("session:update", room.session);
      socket.emit("player:self", player);

      try {
        await prisma.player.create({
          data: { id: player.id, sessionId: room.session.id, name: player.name, avatarIndex: player.avatarIndex },
        });
      } catch (e) {
        console.warn("[db] could not persist player:", (e as Error).message);
      }
    });

    socket.on("session:start", (code: string) => {
      const room = rooms.get(code);
      if (!room) return;
      runRound(io, room, code, 1);
    });

    socket.on("round:tap", ({ code, playerId, timestampMs }) => {
      const room = rooms.get(code);
      if (!room || room.signalTimestamp === null) return;

      const reactionMs = timestampMs - room.signalTimestamp;
      const falseStart = reactionMs < 0;
      const taps = room.taps.get(playerId) ?? [];
      taps.push({ round: room.session.round, reactionMs: Math.max(0, reactionMs), falseStart });
      room.taps.set(playerId, taps);

      const player = room.players.get(playerId);
      const result: RoundResult = {
        round: room.session.round,
        playerId,
        name: player?.name ?? "Player",
        reactionMs: Math.round(Math.max(0, reactionMs)),
        falseStart,
      };
      io.to(code).emit("round:result", result);
      io.to(code).emit("leaderboard:update", toLeaderboard(room));

      try {
        prisma.tap
          .create({
            data: {
              sessionId: room.session.id,
              playerId,
              round: result.round,
              reactionMs: result.reactionMs,
              falseStart,
            },
          })
          .catch(() => void 0);
      } catch {
        /* DB optional */
      }
    });

    socket.on("disconnect", () => {
      if (!currentCode) return;
      const room = rooms.get(currentCode);
      if (!room) return;
      const playerId = socket.data.playerId as string | undefined;
      if (playerId && room.players.has(playerId)) {
        const p = room.players.get(playerId)!;
        p.connected = false;
        io.to(currentCode).emit("players:update", Array.from(room.players.values()));
        io.to(currentCode).emit("activity:log", `${p.name} disconnected`);
      }
    });
  });

  async function runRound(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    room: RoomState,
    code: string,
    round: number
  ) {
    room.session.round = round;
    room.session.status = "countdown";
    io.to(code).emit("session:update", { ...room.session });
    io.to(code).emit("activity:log", `Round ${round} starting — get ready`);

    for (let s = 3; s > 0; s--) {
      io.to(code).emit("round:countdown", s);
      await sleep(700);
    }

    room.session.status = "waiting";
    io.to(code).emit("session:update", { ...room.session });

    const waitMs = randomBetween(1500, 4500); // randomized signal timing
    await sleep(waitMs);

    room.session.status = "live";
    room.signalTimestamp = Date.now();
    io.to(code).emit("session:update", { ...room.session });
    io.to(code).emit("round:signal", round);

    await sleep(2500); // window for taps to register
    room.signalTimestamp = null;

    if (round < room.session.totalRounds) {
      await sleep(1200);
      runRound(io, room, code, round + 1);
    } else {
      room.session.status = "results";
      io.to(code).emit("session:update", { ...room.session });
      const leaderboard = toLeaderboard(room);
      io.to(code).emit("leaderboard:update", leaderboard);
      if (leaderboard[0]) io.to(code).emit("game:winner", leaderboard[0]);
      io.to(code).emit("activity:log", "Session complete — analytics ready");
      await persistAnalytics(room);
    }
  }

  async function persistAnalytics(room: RoomState) {
    try {
      for (const player of room.players.values()) {
        const taps = room.taps.get(player.id) ?? [];
        const a = analyzePlayer(player.id, player.name, taps);
        await prisma.playerAnalyticsSnapshot.create({
          data: {
            sessionId: room.session.id,
            playerId: player.id,
            averageMs: a.averageMs,
            fastestMs: a.fastestMs,
            slowestMs: a.slowestMs,
            stdDevMs: a.stdDevMs,
            consistencyScore: a.consistencyScore,
            accuracy: a.accuracy,
            bestStreak: a.bestStreak,
            fatigueDetected: a.fatigue.detected,
            fatigueSeverity: a.fatigue.severity,
            trendDirection: a.trend.direction,
            trendSlope: a.trend.slopeMsPerRound,
            classification: a.classification,
            suggestions: a.suggestions,
          },
        });
      }
    } catch (e) {
      console.warn("[db] could not persist analytics:", (e as Error).message);
    }
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  httpServer.listen(port, () => {
    console.log(`> TapBattle AI ready on http://localhost:${port}`);
  });
});
