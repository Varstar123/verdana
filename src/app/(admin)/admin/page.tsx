import type { Metadata } from "next";
import Link from "next/link";
import { getAdminKpis, getAdminUsers, SIGNUPS_MONTHLY, MODERATION_REPORTS } from "@/lib/admin";
import { ACTIVITY_FEED } from "@/lib/community";
import { formatCompact } from "@/lib/scoring";
import { StatCard } from "@/components/app/StatCard";
import { BarChart } from "@/components/app/BarChart";
import { ActivityFeed } from "@/components/app/ActivityFeed";
import { Avatar } from "@/components/app/Avatar";
import { ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Admin · Overview" };

export default function AdminOverviewPage() {
  const kpi = getAdminKpis();
  const recent = getAdminUsers().slice(0, 6);

  const cards = [
    { label: "Total users", value: kpi.users, iconKey: "users" as const, accent: "#8B5CF6", formatKey: "compact" as const },
    { label: "Active today", value: kpi.activeToday, iconKey: "bolt" as const, accent: "#22D3EE", formatKey: "compact" as const },
    { label: "New today", value: kpi.newToday, iconKey: "star" as const, accent: "#2DD4BF" },
    { label: "Trees planted", value: kpi.trees, iconKey: "tree" as const, accent: "#22A155", formatKey: "compact" as const },
    { label: "CO₂ (tonnes)", value: kpi.co2Tonnes, iconKey: "leaf" as const, accent: "#43B86E", formatKey: "compact" as const },
    { label: "Open reports", value: kpi.openReports, iconKey: "shield" as const, accent: "#EC4899" },
  ];

  return (
    <div className="container-px space-y-8 py-8">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Platform overview
        </h1>
        <p className="mt-2 text-muted">
          A live pulse of the Verdana community and its impact.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c, i) => (
          <StatCard key={c.label} index={i} {...c} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Growth</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-ink">
                New signups this year
              </h2>
            </div>
            <span className="text-sm font-semibold text-[#22A155]">
              {formatCompact(SIGNUPS_MONTHLY.reduce((s, p) => s + p.value, 0))} total
            </span>
          </div>
          <div className="mt-4">
            <BarChart data={SIGNUPS_MONTHLY} color="#8B5CF6" />
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Moderation</p>
            <Link
              href="/admin/content"
              className="inline-flex items-center gap-1 text-xs font-semibold text-aurora-violet hover:underline"
            >
              Open queue <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="mt-3 font-display text-4xl font-semibold text-ink">
            {kpi.openReports}
          </p>
          <p className="text-sm text-muted">reports awaiting review</p>
          <ul className="mt-4 space-y-2">
            {MODERATION_REPORTS.filter((r) => r.status === "open")
              .slice(0, 3)
              .map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-aurora-pink/12 px-2 py-0.5 text-xs font-medium text-aurora-pink">
                    {r.reason}
                  </span>
                  <span className="truncate text-muted">@{r.author}</span>
                  <span className="ml-auto shrink-0 text-xs text-faint">
                    {r.reports}×
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Newest top members</p>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-semibold text-aurora-violet hover:underline"
            >
              All users <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 space-y-1">
            {recent.map((u) => (
              <li key={u.planetId}>
                <Link
                  href={`/profile/${u.planetId}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-ink/5"
                >
                  <Avatar name={u.displayName} hue={u.avatarHue} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {u.displayName}
                    </p>
                    <p className="truncate text-xs text-faint">
                      {u.level} · {u.country}
                    </p>
                  </div>
                  <span className="text-xs text-faint">
                    {formatCompact(u.ecoScore)} pts
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Recent activity</p>
            <span className="flex items-center gap-1.5 text-xs text-faint">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#22A155]" />
              live
            </span>
          </div>
          <div className="mt-3">
            <ActivityFeed items={ACTIVITY_FEED.slice(0, 6)} />
          </div>
        </div>
      </section>
    </div>
  );
}
