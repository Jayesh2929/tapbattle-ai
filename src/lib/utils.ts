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

/** Formats a past Date as a short relative string, e.g. "2m ago", "just now". */
export function timeAgo(date: Date | string): string {
  const then = new Date(date).getTime();
  const diffMs = Date.now() - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

/** Session codes only use this charset (see generateSessionCode) -- excludes ambiguous I/O/0/1. */
export const SESSION_CODE_REGEX = /^[A-HJ-NP-Z2-9]{6}$/;
/** Player display names: letters, numbers, spaces, and a few safe punctuation marks. */
export const PLAYER_NAME_REGEX = /^[A-Za-z0-9 '_-]{2,24}$/;

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
