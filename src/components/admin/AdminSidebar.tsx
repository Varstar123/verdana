"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheckIcon,
  ChartIcon,
  UsersIcon,
  CompassIcon,
  TargetIcon,
  ChevronRightIcon,
  LeafIcon,
} from "@/components/icons";

const nav = [
  { href: "/admin", label: "Overview", icon: ChartIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/content", label: "Moderation", icon: CompassIcon },
  { href: "/admin/challenges", label: "Challenges", icon: TargetIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-hairline/10 bg-surface/60 px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-aurora-violet text-white">
          <ShieldCheckIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold text-ink">Verdana</p>
          <p className="text-xs text-faint">Admin console</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-aurora-violet/15 text-aurora-violet"
                  : "text-muted hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <LeafIcon className="h-5 w-5" />
        Back to app
        <ChevronRightIcon className="ml-auto h-4 w-4" />
      </Link>
    </aside>
  );
}
