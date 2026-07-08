import { analyzePlayer, type Tap } from "./analytics";
import { randomBetween } from "./utils";

/**
 * Demo data generator used by the analytics dashboard when no live session
 * history is available yet (e.g. viewing the page before a session has run).
 * In production this is replaced by a fetch to /api/analytics/[code], which
 * reads persisted Tap rows via Prisma and runs them through the same
 * analyzePlayer() function — the analytics math is identical either way.
 */
const demoNames = ["Arnav", "Aditya", "Rushada", "Jayesh", "Meera"];

function simulatePlayerTaps(baseMs: number, rounds: number, fatigueFactor: number, noise: number): Tap[] {
  const taps: Tap[] = [];
  for (let round = 1; round <= rounds; round++) {
    const fatigueDrift = fatigueFactor * (round / rounds) * 80;
    const falseStart = Math.random() < 0.06;
    const reactionMs = falseStart
      ? -randomBetween(20, 120)
      : Math.max(120, baseMs + fatigueDrift + randomBetween(-noise, noise));
    taps.push({ round, reactionMs: Math.abs(reactionMs), falseStart });
  }
  return taps;
}

export function generateDemoSession(rounds = 12) {
  const configs = [
    { name: demoNames[0], base: 215, fatigue: 0.2, noise: 30 },
    { name: demoNames[1], base: 260, fatigue: 0.9, noise: 45 },
    { name: demoNames[2], base: 240, fatigue: -0.3, noise: 20 },
    { name: demoNames[3], base: 290, fatigue: 0.4, noise: 60 },
  ];

  const players = configs.map((c, i) => {
    const taps = simulatePlayerTaps(c.base, rounds, c.fatigue, c.noise);
    const analytics = analyzePlayer(`demo-${i}`, c.name, taps);
    return { taps, analytics };
  });

  return { rounds, players };
}
