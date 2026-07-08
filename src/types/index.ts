export interface Player {
  id: string;
  name: string;
  joinedAt: number;
  connected: boolean;
  avatarIndex: number;
}

export type SessionStatus = "lobby" | "countdown" | "waiting" | "live" | "results" | "closed";

export interface GameSession {
  id: string;
  code: string;
  hostId: string;
  status: SessionStatus;
  round: number;
  totalRounds: number;
  createdAt: number;
}

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  avatarIndex: number;
  bestMs: number;
  lastMs: number | null;
  totalPoints: number;
  rank: number;
}

export interface RoundResult {
  round: number;
  playerId: string;
  name: string;
  reactionMs: number;
  falseStart: boolean;
}

export interface ServerToClientEvents {
  "session:update": (session: GameSession) => void;
  "player:self": (player: Player) => void;
  "players:update": (players: Player[]) => void;
  "leaderboard:update": (entries: LeaderboardEntry[]) => void;
  "round:signal": (round: number) => void;
  "round:countdown": (secondsLeft: number) => void;
  "round:result": (result: RoundResult) => void;
  "game:winner": (entry: LeaderboardEntry) => void;
  "activity:log": (message: string) => void;
}

export interface ClientToServerEvents {
  "session:create": (hostId: string) => void;
  "session:join": (payload: { code: string; name: string }) => void;
  "session:start": (code: string) => void;
  "round:tap": (payload: { code: string; playerId: string; timestampMs: number }) => void;
}
