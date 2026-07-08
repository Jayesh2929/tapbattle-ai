import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats milliseconds as e.g. "214ms" or "1.24s" for reaction-time displays. */
export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** Generates a short, human-friendly 6-character session code, e.g. "TB7K2Q". */
export function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export const avatarPalette = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-600",
];

export function colorForIndex(i: number) {
  return avatarPalette[i % avatarPalette.length];
}
