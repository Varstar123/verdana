import type { Metadata } from "next";
import { ALL_PROFILES, GLOBAL_STATS } from "@/lib/community";
import { computeEcoScore, formatCompact } from "@/lib/scoring";
import { LeaderboardBoard } from "@/components/app/LeaderboardBoard";

export const metadata: Metadata = { title: "Changemakers" };

function topCountries() {
  const map = new Map<string, number>();
  for (const p of ALL_PROFILES) {
    map.set(p.country, (map.get(p.country) ?? 0) + computeEcoScore(p.stats));
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([country, score], i) => ({ rank: i + 1, country, score }));
}

export default function LeaderboardPage() {
  const countries = topCountries();

  return (
    <div className="container-px space-y-8 py-8">
      <header>
        <p className="eyebrow">Changemakers</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          The world is competing to heal the planet
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          {GLOBAL_STATS.users.toLocaleString()} citizens across{" "}
          {GLOBAL_STATS.countries} countries. Climb the ranks by taking real
          action — not just donating.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <LeaderboardBoard />

        {/* Top countries */}
        <div className="space-y-6">
          <div className="card-glass p-6">
            <p className="eyebrow">Top countries</p>
            <ul className="mt-4 space-y-1">
              {countries.map((c) => (
                <li
                  key={c.country}
                  className="flex items-center gap-3 rounded-lg px-2 py-2"
                >
                  <span className="w-6 text-center font-mono text-sm text-faint">
                    {c.rank}
                  </span>
                  <span className="flex-1 truncate text-sm text-ink">
                    {c.country}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {formatCompact(c.score)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-glass p-6">
            <p className="eyebrow">Also ranked</p>
            <p className="mt-3 text-sm text-muted">
              Verdana ranks <span className="font-semibold text-ink">universities</span>,{" "}
              <span className="font-semibold text-ink">companies</span>, and{" "}
              <span className="font-semibold text-ink">cities</span> too — rally
              your community and rise together.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["🎓 Universities", "🏢 Companies", "🏙️ Cities", "🌍 Countries"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full bg-ink/5 px-3 py-1 text-xs text-muted"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
