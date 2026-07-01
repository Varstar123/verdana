"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  GlobeIcon,
  TrophyIcon,
  ChartIcon,
  SparkIcon,
} from "@/components/icons";

export function MobileNav({ planetId }: { planetId: string }) {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Home", icon: HomeIcon },
    { href: "/quests", label: "Quests", icon: SparkIcon },
    { href: "/earth", label: "Earth", icon: GlobeIcon },
    { href: "/leaderboard", label: "Ranks", icon: TrophyIcon },
    { href: `/profile/${planetId}`, label: "Profile", icon: ChartIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-hairline/10 bg-canvas/85 px-2 py-2 backdrop-blur-md lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[11px] font-medium transition-colors ${
              active ? "text-brand" : "text-faint hover:text-ink"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
