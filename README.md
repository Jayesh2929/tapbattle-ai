# TapBattle AI

A production-quality, premium-UI implementation of the **TapBattle AI** research paper: a browser-based multiplayer reaction game with real-time Socket.io gameplay, QR-code onboarding, and an AI analytics engine that computes consistency scoring, fatigue detection, and trend prediction.

## Tech stack

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**-style primitives
- **Framer Motion** for animation
- **Socket.io** (custom Node server) for real-time multiplayer
- **PostgreSQL + Prisma** for persistence
- **Recharts** for analytics visualizations
- **qrcode.react** for QR-code session joining

## Getting started

```bash
npm install
cp .env.example .env      # then set DATABASE_URL
npx prisma db push        # creates tables from prisma/schema.prisma
npm run dev                # starts the custom Socket.io + Next server on :3000
```

Open `http://localhost:3000`. The game runs fully in-memory even without a
database connected — Prisma writes are wrapped in try/catch and logged as
warnings rather than blocking gameplay, so you can demo the whole flow before
wiring up PostgreSQL.

## Project structure

```
server/index.ts              # Custom HTTP + Socket.io server (game loop, rounds, signal timing)
prisma/schema.prisma          # Sessions, Players, Taps, AnalyticsSnapshots, EventLogs
src/
  app/
    page.tsx                  # Landing page
    host/page.tsx              # Host dashboard (QR, players, live activity, start game)
    join/page.tsx               # Join page (QR-prefilled or manual code entry)
    game/[sessionId]/page.tsx    # Game screen (countdown, tap button, leaderboard)
    analytics/[sessionId]/page.tsx # AI analytics dashboard (stat cards + charts)
    admin/page.tsx               # Admin dashboard (sessions, latency, event logs)
  components/
    ui/                        # Button, Card, Badge, Input, Skeleton, Progress
    landing/, host/, join/, game/, analytics/, admin/, shared/
  lib/
    analytics.ts               # Core AI engine: consistency score, fatigue detection,
                                #   linear-regression trend, performance classification,
                                #   personalized suggestions
    mockData.ts                 # Demo session generator (feeds analytics dashboard)
    socket.ts, prisma.ts, utils.ts
  types/index.ts                # Shared Socket.io event + domain types
```

## AI analytics engine

All formulas live in `src/lib/analytics.ts` as pure, dependency-free functions
so they run identically on the client (live game screen) and server
(post-session persistence):

- **Average / fastest / slowest / standard deviation** — standard descriptive stats over valid taps.
- **Consistency score** — `100 * e^(-3 * CV)` where CV is the coefficient of variation (stdDev / mean), so low variance yields a high score.
- **Fatigue detection** — compares average reaction time in the second half of a session against the first half; flags `mild` / `moderate` / `high` slowdown.
- **Trend prediction** — simple linear regression over (round, reactionMs) to classify `improving` / `stable` / `declining` and predict the next tap.
- **Performance classification** — rule-based tiers (`Elite Reflexes` → `Needs Warm-up`) from average speed, consistency, and accuracy.
- **Personalized suggestions** — generated from the fatigue, trend, consistency, and accuracy signals above.

## Gameplay flow

1. Host visits `/host` → server generates a 6-character session code and QR code linking to `/join?code=...`.
2. Players scan or type the code + name on `/join`, which joins the Socket.io room and redirects to `/game/[code]`.
3. Host clicks **Start game** → server runs a round loop: 3-2-1 countdown → randomized wait (1.5–4.5s) → signal → 2.5s tap window → repeat for `totalRounds`.
4. Taps are timed against `Date.now() - signalTimestamp`; negative values are flagged as false starts.
5. After the final round, the server computes each player's analytics snapshot and persists it via Prisma; the winner is broadcast with a confetti celebration.

## Notes for production hardening

- Swap `src/lib/mockData.ts` for a real `/api/analytics/[code]` route reading `PlayerAnalyticsSnapshot` rows.
- Broadcast an `admin` Socket.io namespace from `server/index.ts` with live room snapshots to replace the demo data in `/admin`.
- Add authentication for the host role and rate-limit `round:tap` events server-side.
