import type { MonthlyPoint } from "@/lib/types";
import { ALL_PROFILES, GLOBAL_STATS } from "@/lib/community";
import { computeEcoScore, getLevel } from "@/lib/scoring";

/**
 * Admin-only demo data + aggregates. Derived from the same seeded community
 * dataset so the admin module stays consistent with the public app.
 */

export type UserRole = "member" | "moderator" | "admin";
export type UserStatus = "active" | "suspended";

export interface AdminUserRow {
  planetId: string;
  displayName: string;
  username: string;
  avatarHue: number;
  country: string;
  level: string;
  ecoScore: number;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
}

export function getAdminUsers(): AdminUserRow[] {
  return ALL_PROFILES.map((p, i) => {
    const ecoScore = computeEcoScore(p.stats);
    const role: UserRole =
      i === 0 ? "admin" : i % 9 === 0 ? "moderator" : "member";
    const status: UserStatus = i === 5 ? "suspended" : "active";
    return {
      planetId: p.planetId,
      displayName: p.displayName,
      username: p.username,
      avatarHue: p.avatarHue,
      country: p.country,
      level: getLevel(ecoScore).name,
      ecoScore,
      role,
      status,
      joinedAt: p.joinedAt,
    };
  }).sort((a, b) => b.ecoScore - a.ecoScore);
}

export const SIGNUPS_MONTHLY: MonthlyPoint[] = [
  { label: "Jan", value: 1820 }, { label: "Feb", value: 2410 },
  { label: "Mar", value: 2230 }, { label: "Apr", value: 3120 },
  { label: "May", value: 3980 }, { label: "Jun", value: 4620 },
  { label: "Jul", value: 4210 }, { label: "Aug", value: 5180 },
  { label: "Sep", value: 5820 }, { label: "Oct", value: 6240 },
  { label: "Nov", value: 6910 }, { label: "Dec", value: 7480 },
];

export type ReportStatus = "open" | "resolved";

export interface ModerationReport {
  id: string;
  excerpt: string;
  author: string;
  authorHue: number;
  reason: string;
  reports: number;
  status: ReportStatus;
  when: string;
}

export const MODERATION_REPORTS: ModerationReport[] = [
  { id: "r1", excerpt: "Check out this amazing carbon offset scheme — DM me to 10x your trees!", author: "spammy_sam", authorHue: 12, reason: "Spam / scam", reports: 14, status: "open", when: "8m" },
  { id: "r2", excerpt: "These before/after photos are clearly fake, total greenwashing…", author: "skeptic99", authorHue: 200, reason: "Misinformation", reports: 6, status: "open", when: "41m" },
  { id: "r3", excerpt: "Posted someone else's cleanup photos as my own contribution.", author: "copycat_io", authorHue: 300, reason: "Impersonation", reports: 4, status: "open", when: "2h" },
  { id: "r4", excerpt: "Offensive reply in the Ocean Cleanup thread.", author: "ranter", authorHue: 340, reason: "Harassment", reports: 9, status: "open", when: "5h" },
  { id: "r5", excerpt: "Duplicate forum post across 6 categories.", author: "crosspost", authorHue: 90, reason: "Spam", reports: 3, status: "resolved", when: "1d" },
];

export function getAdminKpis() {
  const openReports = MODERATION_REPORTS.filter((r) => r.status === "open").length;
  return {
    users: GLOBAL_STATS.users,
    activeToday: GLOBAL_STATS.online,
    newToday: 218,
    trees: GLOBAL_STATS.trees,
    co2Tonnes: GLOBAL_STATS.co2Tonnes,
    plasticTonnes: GLOBAL_STATS.plasticTonnes,
    openReports,
    countries: GLOBAL_STATS.countries,
  };
}
