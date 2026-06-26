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
} from "@/components/icons";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/earth", label: "My Earth", icon: GlobeIcon },
  { href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
  { href: "/community", label: "Community", icon: UsersIcon, soon: true },
  { href: "/forums", label: "Forums", icon: CompassIcon, soon: true },
  { href: "/challenges", label: "Challenges", icon: TargetIcon, soon: true },
];

export function Sidebar({ planetId }: { planetId: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-hairline/10 bg-surface/60 px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-glow">
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
          const content = (
            <>
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-faint">
                  Soon
                </span>
              )}
            </>
          );
          const cls = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            active
              ? "bg-brand/12 text-brand"
              : "text-muted hover:bg-ink/5 hover:text-ink"
          } ${item.soon ? "cursor-default opacity-70" : ""}`;

          return item.soon ? (
            <span key={item.href} className={cls} aria-disabled>
              {content}
            </span>
          ) : (
            <Link key={item.href} href={item.href} className={cls}>
              {content}
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
