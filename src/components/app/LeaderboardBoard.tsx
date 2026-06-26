"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getLeaderboard,
  DEMO_PROFILE,
  GLOBAL_RANK,
} from "@/lib/community";
import { computeEcoScore, formatCompact } from "@/lib/scoring";
import type {
  LeaderboardCategory,
  LeaderboardPeriod,
} from "@/lib/types";
import { Avatar } from "@/components/app/Avatar";

const CATEGORIES: { key: LeaderboardCategory; label: string }[] = [
  { key: "ecoScore", label: "Top Contributors" },
  { key: "trees", label: "Most Trees" },
  { key: "co2", label: "CO₂ Offset" },
  { key: "plastic", label: "Plastic Removed" },
  { key: "donations", label: "Top Donators" },
  { key: "volunteer", label: "Top Volunteers" },
  { key: "streak", label: "Longest Streak" },
  { key: "earthHealth", label: "Fastest Growing Planet" },
];

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

function valueForCategory(category: LeaderboardCategory): {
  value: number;
  unit: string;
} {
  const s = DEMO_PROFILE.stats;
  switch (category) {
    case "trees":
      return { value: s.treesPlanted, unit: "trees" };
    case "co2":
      return { value: s.co2OffsetKg, unit: "kg CO₂" };
    case "plastic":
      return { value: s.plasticRemovedKg, unit: "kg" };
    case "donations":
      return { value: s.donationsUsd, unit: "USD" };
    case "volunteer":
      return { value: s.volunteerHours, unit: "hrs" };
    case "streak":
      return { value: s.streakDays, unit: "days" };
    default:
      return { value: computeEcoScore(s), unit: "pts" };
  }
}

export function LeaderboardBoard() {
  const [category, setCategory] = useState<LeaderboardCategory>("ecoScore");
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const rows = getLeaderboard(category);
  const you = valueForCategory(category);

  return (
    <div>
      {/* Category tabs */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === c.key
                ? "bg-brand text-white"
                : "bg-surface text-muted ring-1 ring-inset ring-hairline/15 hover:text-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Period pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              period === p.key
                ? "bg-ink/10 text-ink"
                : "text-faint hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-glass mt-5 overflow-hidden">
        <ul>
          {rows.map((row) => (
            <li key={row.planetId} className="border-b border-hairline/8 last:border-0">
              <Link
                href={`/profile/${row.planetId}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink/5"
              >
                <span className="w-9 shrink-0 text-center text-lg">
                  {row.rank <= 3 ? (
                    MEDAL[row.rank - 1]
                  ) : (
                    <span className="font-mono text-sm text-faint">{row.rank}</span>
                  )}
                </span>
                <Avatar name={row.displayName} hue={row.avatarHue} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {row.displayName}
                  </p>
                  <p className="truncate text-xs text-faint">
                    {row.level} · {row.country}
                  </p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="font-display text-base font-semibold text-ink">
                    {formatCompact(row.value)}
                  </span>{" "}
                  <span className="text-xs text-faint">{row.unit}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Your position */}
        <div className="flex items-center gap-3 border-t-2 border-brand/30 bg-brand/8 px-4 py-3">
          <span className="w-9 shrink-0 text-center font-mono text-sm font-semibold text-brand">
            #{GLOBAL_RANK.rank.toLocaleString()}
          </span>
          <Avatar name={DEMO_PROFILE.displayName} hue={DEMO_PROFILE.avatarHue} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand">
              You · {DEMO_PROFILE.displayName}
            </p>
            <p className="truncate text-xs text-faint">
              Top {GLOBAL_RANK.percentile}% globally
            </p>
          </div>
          <span className="shrink-0 text-right">
            <span className="font-display text-base font-semibold text-ink">
              {formatCompact(you.value)}
            </span>{" "}
            <span className="text-xs text-faint">{you.unit}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
