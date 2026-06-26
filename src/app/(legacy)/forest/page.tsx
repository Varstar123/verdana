import type { Metadata } from "next";
import Link from "next/link";
import { getLocation, getUserForest, getUserStats } from "@/lib/data";
import { TreeCard } from "@/components/TreeCard";
import { ArrowRightIcon, TreeIcon, LeafIcon, GlobeIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "My Forest",
  description: "Your living, GPS-verified forest — tracked over time.",
};

export default function ForestPage() {
  const stats = getUserStats();
  const trees = getUserForest();

  const headlineStats = [
    {
      icon: TreeIcon,
      label: "Trees",
      value: stats.totalTrees.toString(),
    },
    {
      icon: LeafIcon,
      label: "CO₂ sequestered",
      value: `${stats.totalCarbonKg} kg`,
    },
    {
      icon: GlobeIcon,
      label: "Canopy area",
      value: `${stats.forestAreaM2} m²`,
    },
    {
      icon: TreeIcon,
      label: "Survival rate",
      value: `${Math.round(stats.survivalRate * 100)}%`,
    },
  ];

  return (
    <div className="container-px py-14">
      {/* Greeting + streak */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-2 text-4xl text-forest-900 sm:text-5xl">
            {stats.displayName}&apos;s forest
          </h1>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-forest-600 px-5 py-3 text-white">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-serif text-2xl leading-none">
              {stats.streakDays}
            </p>
            <p className="text-xs text-white/70">day streak</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headlineStats.map((s) => (
          <div key={s.label} className="card p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-600">
              <s.icon className="h-5 w-5" />
            </span>
            <dt className="mt-4 text-xs uppercase tracking-wide text-forest-900/50">
              {s.label}
            </dt>
            <dd className="mt-1 font-serif text-3xl text-forest-900">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Trees */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-forest-900">Your trees</h2>
            <Link
              href="/plant"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-800"
            >
              Plant more
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {trees.map((tree) => (
              <TreeCard
                key={tree.treeId}
                tree={tree}
                location={getLocation(tree.locationId)}
              />
            ))}
          </div>
        </section>

        {/* Badges */}
        <aside>
          <h2 className="text-2xl text-forest-900">Achievements</h2>
          <div className="mt-5 space-y-3">
            {stats.badges.map((badge) => (
              <div
                key={badge.badgeId}
                className={`flex items-center gap-4 rounded-2xl border p-4 ${
                  badge.achieved
                    ? "border-forest-100 bg-white"
                    : "border-dashed border-forest-100 bg-ivory opacity-60"
                }`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full text-lg ${
                    badge.achieved
                      ? "bg-forest-600 text-white"
                      : "bg-forest-50 text-forest-400"
                  }`}
                >
                  {badge.achieved ? "★" : "○"}
                </span>
                <div>
                  <p className="font-semibold text-forest-900">{badge.name}</p>
                  <p className="text-xs text-forest-900/55">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
