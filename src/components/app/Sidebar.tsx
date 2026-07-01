"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeafIcon } from "@/components/icons";
import {
  HomeIcon,
  GlobeIcon,
  TrophyIcon,
  UsersIcon,
  CompassIcon,
  TargetIcon,
  ChartIcon,
  SproutIcon,
  StarIcon,
  HeartIcon,
  SparkIcon,
} from "@/components/icons";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/earth", label: "My Earth", icon: SproutIcon },
  { href: "/quests", label: "Quests", icon: SparkIcon },
  { href: "/globe", label: "Global Earth", icon: GlobeIcon },
  { href: "/leaderboard", label: "Changemakers", icon: TrophyIcon },
  { href: "/community", label: "Community", icon: UsersIcon },
  { href: "/forums", label: "Forums", icon: CompassIcon },
  { href: "/challenges", label: "Challenges", icon: TargetIcon },
  { href: "/rewards", label: "Levels", icon: StarIcon },
  { href: "/mission", label: "Our Mission", icon: HeartIcon },
];

export function Sidebar({ planetId }: { planetId: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-hairline/10 bg-surface/60 px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-glow transition-colors dark:bg-forest-50 dark:text-forest-700 dark:shadow-none dark:ring-1 dark:ring-forest-200/60">
          <LeafIcon className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-semibold tracking-tight text-ink">
          Verdana
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand/12 text-brand"
                  : "text-muted hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href={`/profile/${planetId}`}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <ChartIcon className="h-5 w-5" />
        My Profile
      </Link>
    </aside>
  );
}
