import type { Rank } from "@/types";

export interface RankMeta {
  rank: Rank;
  label: string;
  minXP: number;
  maxXP: number;
  color: string;
  bg: string;
  border: string;
  glow: string;
  description: string;
}

export const RANKS: RankMeta[] = [
  {
    rank: "E",
    label: "E",
    minXP: 0,
    maxXP: 99,
    color: "#A1A1AA",
    bg: "rgba(113,113,122,0.15)",
    border: "rgba(113,113,122,0.3)",
    glow: "rgba(113,113,122,0.4)",
    description: "Beginner",
  },
  {
    rank: "D",
    label: "D",
    minXP: 100,
    maxXP: 299,
    color: "#10B981",
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.3)",
    glow: "rgba(16,185,129,0.4)",
    description: "Novice",
  },
  {
    rank: "C",
    label: "C",
    minXP: 300,
    maxXP: 699,
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.15)",
    border: "rgba(14,165,233,0.3)",
    glow: "rgba(14,165,233,0.4)",
    description: "Apprentice",
  },
  {
    rank: "B",
    label: "B",
    minXP: 700,
    maxXP: 1499,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.15)",
    border: "rgba(139,92,246,0.3)",
    glow: "rgba(139,92,246,0.4)",
    description: "Skilled",
  },
  {
    rank: "A",
    label: "A",
    minXP: 1500,
    maxXP: 2999,
    color: "#EA580C",
    bg: "rgba(234,88,12,0.15)",
    border: "rgba(234,88,12,0.3)",
    glow: "rgba(234,88,12,0.4)",
    description: "Expert",
  },
  {
    rank: "S",
    label: "S",
    minXP: 3000,
    maxXP: 5999,
    color: "#EAB308",
    bg: "rgba(234,179,8,0.15)",
    border: "rgba(234,179,8,0.3)",
    glow: "rgba(234,179,8,0.5)",
    description: "Elite",
  },
  {
    rank: "SS",
    label: "SS",
    minXP: 6000,
    maxXP: 9999,
    color: "#DC2626",
    bg: "rgba(220,38,38,0.15)",
    border: "rgba(220,38,38,0.3)",
    glow: "rgba(220,38,38,0.5)",
    description: "Master",
  },
  {
    rank: "SSS",
    label: "SSS",
    minXP: 10000,
    maxXP: Infinity,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.15)",
    border: "rgba(236,72,153,0.3)",
    glow: "rgba(236,72,153,0.6)",
    description: "Legendary",
  },
];

export function getRankMeta(rank: Rank): RankMeta {
  return RANKS.find((r) => r.rank === rank) ?? RANKS[0];
}

export function getRankFromXP(xp: number): Rank {
  const rank = [...RANKS].reverse().find((r) => xp >= r.minXP);
  return rank?.rank ?? "E";
}

export function getNextRank(rank: Rank): RankMeta | null {
  const idx = RANKS.findIndex((r) => r.rank === rank);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getXPProgress(xp: number, rank: Rank): number {
  const meta = getRankMeta(rank);
  const next = getNextRank(rank);
  if (!next) return 100;
  const range = next.minXP - meta.minXP;
  const progress = xp - meta.minXP;
  return Math.min(100, Math.floor((progress / range) * 100));
}

export function getXPToNextRank(xp: number, rank: Rank): number {
  const next = getNextRank(rank);
  if (!next) return 0;
  return next.minXP - xp;
}
