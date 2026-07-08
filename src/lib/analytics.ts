/**
 * AI Analytics Engine
 * ---------------------------------------------------------------------------
 * Implements the statistical + heuristic models described in the TapBattle AI
 * paper: average reaction time, standard deviation, a normalized consistency
 * score, linear-regression trend prediction, fatigue detection, performance
 * classification, and personalized improvement suggestions.
 *
 * These are intentionally dependency-free (pure functions over arrays of
 * reaction times in milliseconds) so they can run identically on the client
 * (live game screen) and server (post-session persistence).
 */

export interface Tap {
  round: number;
  reactionMs: number; // time between signal and tap, in ms
  falseStart: boolean;
}

export interface PlayerAnalytics {
  playerId: string;
  name: string;
  averageMs: number;
  fastestMs: number;
  slowestMs: number;
  stdDevMs: number;
  consistencyScore: number; // 0-100, higher = more consistent
  accuracy: number; // 0-100, % of rounds without false start
  bestStreak: number;
  fatigue: FatigueResult;
  trend: TrendResult;
  classification: PerformanceClass;
  suggestions: string[];
}

export interface FatigueResult {
  detected: boolean;
  severity: "none" | "mild" | "moderate" | "high";
  slowdownPct: number; // % slower in back half vs front half
}

export interface TrendResult {
  slopeMsPerRound: number; // negative = improving, positive = declining
  direction: "improving" | "stable" | "declining";
  predictedNextMs: number;
}

export type PerformanceClass =
  | "Elite Reflexes"
  | "Sharp & Consistent"
  | "Solid Competitor"
  | "Developing"
  | "Needs Warm-up";

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = mean(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

/**
 * Consistency score: derived from coefficient of variation (stdDev / mean),
 * inverted and scaled to a 0-100 range so lower variance -> higher score.
 */
export function calculateConsistencyScore(times: number[]): number {
  if (times.length < 2) return 100;
  const m = mean(times);
  const sd = stdDev(times);
  const cv = m === 0 ? 0 : sd / m;
  const score = 100 * Math.exp(-3 * cv); // exponential decay penalizes variance
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Simple linear regression over (round, reactionMs) to detect whether a
 * player is trending faster or slower across the session, and to predict
 * their next likely reaction time.
 */
export function calculateTrend(taps: Tap[]): TrendResult {
  const valid = taps.filter((t) => !t.falseStart);
  if (valid.length < 2) {
    return { slopeMsPerRound: 0, direction: "stable", predictedNextMs: valid[0]?.reactionMs ?? 0 };
  }
  const n = valid.length;
  const xs = valid.map((t) => t.round);
  const ys = valid.map((t) => t.reactionMs);
  const xMean = mean(xs);
  const yMean = mean(ys);
  const num = xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0);
  const den = xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  const nextRound = Math.max(...xs) + 1;
  const predictedNextMs = Math.max(80, slope * nextRound + intercept);

  let direction: TrendResult["direction"] = "stable";
  if (slope < -2) direction = "improving";
  else if (slope > 2) direction = "declining";

  return { slopeMsPerRound: Number(slope.toFixed(2)), direction, predictedNextMs: Math.round(predictedNextMs) };
}

/**
 * Fatigue detection: compares average reaction time in the second half of
 * the session against the first half. A significant slowdown suggests
 * mental/physical fatigue rather than random variance.
 */
export function detectFatigue(taps: Tap[]): FatigueResult {
  const valid = taps.filter((t) => !t.falseStart).sort((a, b) => a.round - b.round);
  if (valid.length < 4) {
    return { detected: false, severity: "none", slowdownPct: 0 };
  }
  const mid = Math.floor(valid.length / 2);
  const firstHalf = valid.slice(0, mid).map((t) => t.reactionMs);
  const secondHalf = valid.slice(mid).map((t) => t.reactionMs);
  const firstAvg = mean(firstHalf);
  const secondAvg = mean(secondHalf);
  const slowdownPct = firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;

  let severity: FatigueResult["severity"] = "none";
  if (slowdownPct > 25) severity = "high";
  else if (slowdownPct > 12) severity = "moderate";
  else if (slowdownPct > 5) severity = "mild";

  return {
    detected: slowdownPct > 5,
    severity,
    slowdownPct: Number(slowdownPct.toFixed(1)),
  };
}

export function calculateBestStreak(taps: Tap[], thresholdMs = 300): number {
  let best = 0;
  let current = 0;
  for (const t of taps.sort((a, b) => a.round - b.round)) {
    if (!t.falseStart && t.reactionMs <= thresholdMs) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

export function classifyPerformance(
  averageMs: number,
  consistencyScore: number,
  accuracy: number
): PerformanceClass {
  if (averageMs < 230 && consistencyScore > 80 && accuracy > 90) return "Elite Reflexes";
  if (averageMs < 300 && consistencyScore > 65) return "Sharp & Consistent";
  if (averageMs < 400 && consistencyScore > 45) return "Solid Competitor";
  if (accuracy < 60) return "Needs Warm-up";
  return "Developing";
}

export function generateSuggestions(
  fatigue: FatigueResult,
  trend: TrendResult,
  consistencyScore: number,
  accuracy: number
): string[] {
  const tips: string[] = [];

  if (fatigue.detected) {
    tips.push(
      fatigue.severity === "high"
        ? "Significant slowdown detected late in the session — consider shorter sessions with breaks between rounds."
        : "Reaction times drifted slower in later rounds — a brief pause between matches may help sustain sharpness."
    );
  }
  if (trend.direction === "improving") {
    tips.push("Reaction time improved as the session progressed — momentum is on your side, keep the streak going.");
  }
  if (trend.direction === "declining") {
    tips.push("Reaction time trended slower across rounds — try resetting focus with a few practice taps before the next session.");
  }
  if (consistencyScore < 50) {
    tips.push("Tap timing varies a lot round to round — focus on a steady, repeatable pre-tap posture to tighten consistency.");
  } else if (consistencyScore > 85) {
    tips.push("Excellent timing consistency — your reaction rhythm is highly repeatable.");
  }
  if (accuracy < 70) {
    tips.push("Several early taps were registered before the signal — wait for the visual cue fully before reacting.");
  }
  if (tips.length === 0) {
    tips.push("Balanced performance across speed, consistency, and accuracy — solid all-around session.");
  }
  return tips;
}

export function analyzePlayer(playerId: string, name: string, taps: Tap[]): PlayerAnalytics {
  const valid = taps.filter((t) => !t.falseStart);
  const times = valid.map((t) => t.reactionMs);
  const averageMs = Math.round(mean(times));
  const fastestMs = times.length ? Math.min(...times) : 0;
  const slowestMs = times.length ? Math.max(...times) : 0;
  const sd = Math.round(stdDev(times));
  const consistencyScore = calculateConsistencyScore(times);
  const accuracy = taps.length ? Math.round((valid.length / taps.length) * 100) : 100;
  const bestStreak = calculateBestStreak(taps);
  const fatigue = detectFatigue(taps);
  const trend = calculateTrend(taps);
  const classification = classifyPerformance(averageMs, consistencyScore, accuracy);
  const suggestions = generateSuggestions(fatigue, trend, consistencyScore, accuracy);

  return {
    playerId,
    name,
    averageMs,
    fastestMs,
    slowestMs,
    stdDevMs: sd,
    consistencyScore,
    accuracy,
    bestStreak,
    fatigue,
    trend,
    classification,
    suggestions,
  };
}
