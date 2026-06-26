"use client";

import { useState } from "react";
import Link from "next/link";
import type { AdminUserRow, UserRole } from "@/lib/admin";
import { formatCompact } from "@/lib/scoring";
import { Avatar } from "@/components/app/Avatar";
import { SearchIcon, ShieldCheckIcon, CheckIcon, LockIcon } from "@/components/icons";

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-aurora-violet/15 text-aurora-violet",
  moderator: "bg-aurora-cyan/15 text-aurora-cyan",
  member: "bg-ink/5 text-muted",
};

export function UsersTable({ initial }: { initial: AdminUserRow[] }) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const q = query.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    const matchesQ =
      !q ||
      r.displayName.toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q) ||
      r.planetId.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || r.role === roleFilter;
    return matchesQ && matchesRole;
  });

  function cycleRole(planetId: string) {
    const order: UserRole[] = ["member", "moderator", "admin"];
    setRows((rs) =>
      rs.map((r) =>
        r.planetId === planetId
          ? { ...r, role: order[(order.indexOf(r.role) + 1) % order.length] }
          : r,
      ),
    );
  }

  function toggleStatus(planetId: string) {
    setRows((rs) =>
      rs.map((r) =>
        r.planetId === planetId
          ? { ...r, status: r.status === "active" ? "suspended" : "active" }
          : r,
      ),
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-hairline/15 bg-surface px-4 py-2 sm:w-80">
          <SearchIcon className="h-4 w-4 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or Planet ID…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "member", "moderator", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                roleFilter === r
                  ? "bg-aurora-violet text-white"
                  : "bg-surface text-muted ring-1 ring-inset ring-hairline/15 hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card-glass mt-5 overflow-hidden">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 border-b border-hairline/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-faint md:grid">
          <span>Member</span>
          <span>Eco-score</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <ul>
          {filtered.map((u) => (
            <li
              key={u.planetId}
              className="grid grid-cols-1 gap-3 border-b border-hairline/8 px-4 py-3 last:border-0 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center"
            >
              <Link href={`/profile/${u.planetId}`} className="flex items-center gap-3 hover:opacity-90">
                <Avatar name={u.displayName} hue={u.avatarHue} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{u.displayName}</p>
                  <p className="truncate font-mono text-xs text-faint">{u.planetId}</p>
                </div>
              </Link>

              <span className="text-sm text-muted">
                {formatCompact(u.ecoScore)} <span className="text-faint">· {u.level}</span>
              </span>

              <span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_STYLES[u.role]}`}>
                  {u.role}
                </span>
              </span>

              <span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    u.status === "active"
                      ? "bg-[#22A155]/12 text-[#22A155]"
                      : "bg-aurora-pink/12 text-aurora-pink"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {u.status}
                </span>
              </span>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => cycleRole(u.planetId)}
                  title="Change role"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-hairline/15 bg-surface text-muted transition-colors hover:text-ink"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleStatus(u.planetId)}
                  title={u.status === "active" ? "Suspend" : "Reactivate"}
                  className={`grid h-8 w-8 place-items-center rounded-lg border border-hairline/15 bg-surface transition-colors hover:text-ink ${
                    u.status === "active" ? "text-aurora-pink" : "text-[#22A155]"
                  }`}
                >
                  {u.status === "active" ? <LockIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                </button>
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-faint">No users match.</p>
        )}
      </div>

      <p className="mt-3 text-xs text-faint">
        Showing {filtered.length} of {rows.length}. Actions are local in demo mode;
        wire them to Firestore/Clerk to persist.
      </p>
    </div>
  );
}
