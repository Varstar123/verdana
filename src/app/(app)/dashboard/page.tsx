import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  computeEcoScore,
  computeEarthHealth,
  getEarthStage,
  getLevel,
  formatCompact,
  ordinal,
} from "@/lib/scoring";
import {
  GLOBAL_RANK,
  nearbyRankRows,
  DAILY_CHALLENGES,
  MONTHLY_CONTRIB,
  WEEKLY_ACTIVITY,
  MILESTONES,
} from "@/lib/community";
import { getActivity } from "@/lib/social";
import { EarthScene } from "@/components/earth/EarthScene";
import { StatCard } from "@/components/app/StatCard";
import { ProgressRing } from "@/components/app/ProgressRing";
import { BarChart } from "@/components/app/BarChart";
import { BadgeChip } from "@/components/app/BadgeChip";
import { ActivityFeed } from "@/components/app/ActivityFeed";
import { CountUp } from "@/components/app/CountUp";
import { Avatar } from "@/components/app/Avatar";
import {
  FlameIcon,
  TrendUpIcon,
  ChevronRightIcon,
  CheckIcon,
  TargetIcon,
  StarIcon,
} from "@/components/icons";
import { BADGES } from "@/lib/scoring";
import { DashboardSkeleton } from "@/components/app/Skeletons";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const { profile } = await getSession();
  const s = profile.stats;
  const ecoScore = computeEcoScore(s);
  const level = getLevel(ecoScore);
  const health = computeEarthHealth(ecoScore);
  const { stage, index: stageIndex } = getEarthStage(health);
  const nearby = nearbyRankRows();
  const activity = await getActivity();

  const stats = [
    { label: "Trees planted", value: s.treesPlanted, iconKey: "tree" as const, accent: "#22A155" },
    { label: "CO₂ offset", value: s.co2OffsetKg, unit: "kg", iconKey: "leaf" as const, accent: "#2DD4BF", formatKey: "compact" as const },
    { label: "Plastic removed", value: s.plasticRemovedKg, unit: "kg", iconKey: "recycle" as const, accent: "#22D3EE" },
    { label: "Donated", value: s.donationsUsd, iconKey: "heart" as const, accent: "#EC4899", formatKey: "usd" as const },
    { label: "Eco points", value: s.ecoPoints, iconKey: "bolt" as const, accent: "#8B5CF6", formatKey: "compact" as const },
    { label: "Day streak", value: s.streakDays, unit: "days", iconKey: "flame" as const, accent: "#FB923C" },
  ];

  return (
    <div className="container-px space-y-8 py-8">
      {/* Greeting */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {profile.displayName.split(" ")[0]}, your Earth is{" "}
            <span className="text-gradient">{health}% restored</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: level.accent }}
          >
            <StarIcon className="h-4 w-4" />
            Lv {level.index + 1} · {level.name}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FB923C]/15 px-4 py-2 text-sm font-semibold text-[#FB923C]">
            <FlameIcon className="h-4 w-4" />
            {s.streakDays} days
          </span>
        </div>
      </header>

      {/* Earth + Global rank */}
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Living Earth */}
        <div className="card-glass relative overflow-hidden">
          <div className="aurora-bg opacity-60" />
          <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="eyebrow">Your living Earth</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                {stage.title}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted">
                {stage.description}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 w-40 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${health}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-ink">{health}%</span>
              </div>
              <p className="mt-1 text-xs text-faint">
                Stage {stageIndex + 1} of 7
              </p>
              <Link href="/earth" className="btn-secondary mt-4">
                Explore in 3D
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="mx-auto h-56 w-56 sm:h-64 sm:w-64">
              <EarthScene health={health} interactive={false} />
            </div>
          </div>
        </div>

        {/* Global rank */}
        <div className="card-glass p-6">
          <p className="eyebrow">Global ranking</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-display text-4xl font-semibold text-ink">
              #<CountUp value={GLOBAL_RANK.rank} />
            </span>
            <span className="pb-1 text-sm text-muted">
              of {GLOBAL_RANK.total.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand/12 px-3 py-1 text-xs font-semibold text-brand">
              Top {GLOBAL_RANK.percentile}%
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#22A155]/12 px-3 py-1 text-xs font-semibold text-[#22A155]">
              <TrendUpIcon className="h-3.5 w-3.5" />+{GLOBAL_RANK.movement} this week
            </span>
          </div>
          <p className="mt-4 text-xs text-faint">
            {GLOBAL_RANK.toNextRank} eco-points to climb to{" "}
            {ordinal(GLOBAL_RANK.rank - 1)}
          </p>

          <div className="mt-4 space-y-1 border-t border-hairline/10 pt-4">
            {nearby.map((row) => {
              const you = row.planetId === profile.planetId;
              return (
                <Link
                  key={row.rank}
                  href={`/profile/${row.planetId}`}
                  className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                    you ? "bg-brand/12" : "hover:bg-ink/5"
                  }`}
                >
                  <span className="w-10 shrink-0 font-mono text-xs text-faint">
                    #{row.rank}
                  </span>
                  <Avatar name={row.displayName} hue={row.avatarHue} size={26} />
                  <span className={`flex-1 truncate ${you ? "font-semibold text-brand" : "text-ink"}`}>
                    {you ? "You" : row.displayName}
                  </span>
                  <span className="text-xs text-faint">
                    {formatCompact(row.value)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((st, i) => (
          <StatCard key={st.label} index={i} {...st} />
        ))}
      </section>

      {/* Score + charts */}
      <section className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Environmental score */}
        <div className="card-glass flex flex-col items-center p-6 text-center">
          <p className="eyebrow self-start">Environmental score</p>
          <div className="my-4">
            <ProgressRing progress={level.progress} color={level.accent} size={170}>
              <div>
                <div className="font-display text-3xl font-semibold text-ink">
                  <CountUp value={ecoScore} formatKey="compact" />
                </div>
                <p className="text-xs text-faint">eco-score</p>
              </div>
            </ProgressRing>
          </div>
          <p className="text-sm font-semibold text-ink">
            {level.name}
            {level.nextScore && (
              <span className="font-normal text-muted">
                {" "}
                — {Math.round(level.progress * 100)}% to{" "}
                {["Sapling","Gardener","Forest Ranger","Earth Guardian","Planet Protector","Climate Champion","Legend of Verdana"][level.index] ?? "max"}
              </span>
            )}
          </p>
          <p className="mt-2 text-xs text-faint">
            Built from trees, recycling, volunteering, donations, learning &amp;
            your daily streak — not just money.
          </p>
        </div>

        {/* Monthly + weekly */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Contribution this year</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">
                Monthly eco-points
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#22A155]">
              <TrendUpIcon className="h-4 w-4" /> +21%
            </span>
          </div>
          <div className="mt-4">
            <BarChart data={MONTHLY_CONTRIB} color="#22A155" />
          </div>
          <div className="mt-6 border-t border-hairline/10 pt-4">
            <p className="text-sm font-medium text-muted">This week</p>
            <div className="mt-3 flex items-end justify-between gap-2">
              {WEEKLY_ACTIVITY.map((d, i) => {
                const max = Math.max(...WEEKLY_ACTIVITY.map((x) => x.value));
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-20 w-full items-end justify-center">
                      <div
                        className="w-2.5 rounded-full bg-aurora-violet/70"
                        style={{ height: `${(d.value / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-faint">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Badges + milestones */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Achievements</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">
                Badges · {profile.badgeIds.length}/{BADGES.length}
              </h3>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {BADGES.map((b) => (
              <BadgeChip
                key={b.id}
                id={b.id}
                earned={profile.badgeIds.includes(b.id)}
              />
            ))}
          </div>
        </div>

        <div className="card-glass p-6">
          <p className="eyebrow">Milestones</p>
          <ul className="mt-4 space-y-2.5">
            {MILESTONES.map((m) => (
              <li key={m.label} className="flex items-center gap-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    m.done
                      ? "bg-brand text-white"
                      : "bg-ink/5 text-faint"
                  }`}
                >
                  {m.done ? <CheckIcon className="h-4 w-4" /> : <TargetIcon className="h-4 w-4" />}
                </span>
                <span className={m.done ? "text-sm text-ink" : "text-sm text-muted"}>
                  {m.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Friends activity + challenges */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Friends activity</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">
                The community is alive
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-faint">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#22A155]" />
              live
            </span>
          </div>
          <div className="mt-3">
            <ActivityFeed items={activity} />
          </div>
        </div>

        <div className="card-glass p-6">
          <p className="eyebrow">Today&apos;s challenges</p>
          <ul className="mt-4 space-y-2.5">
            {DAILY_CHALLENGES.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-hairline/10 bg-surface p-3"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    c.done ? "bg-brand text-white" : "bg-ink/5 text-faint"
                  }`}
                >
                  {c.done ? <CheckIcon className="h-4 w-4" /> : <TargetIcon className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{c.title}</p>
                  <p className="truncate text-xs text-faint">{c.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-aurora-violet/12 px-2.5 py-1 text-xs font-semibold text-aurora-violet">
                  +{c.rewardXp} XP
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
