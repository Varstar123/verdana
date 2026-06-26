import type {
  ActivityItem,
  DailyChallenge,
  GlobalRank,
  GlobalStats,
  LeaderboardCategory,
  LeaderboardEntry,
  MonthlyPoint,
  Profile,
  ProfileStats,
} from "@/lib/types";
import { computeEcoScore, evaluateBadges, getLevel } from "@/lib/scoring";

/* ---------------------------------------------------------------------------
 * Deterministic demo dataset.
 * Everything here is seeded (no Math.random / Date.now at runtime) so the
 * server and client render identical markup — no hydration drift. When Firebase
 * is configured, src/lib/session.ts and the page loaders read from Firestore
 * instead; these helpers remain the demo fallback.
 * ------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Sarah", "Alex", "Michael", "Priya", "Liam", "Mei", "Noah", "Aisha",
  "Diego", "Yuki", "Omar", "Elena", "Kofi", "Ingrid", "Tariq", "Sofia",
  "Hiro", "Amara", "Lucas", "Nadia", "Ravi", "Clara", "Mateo", "Lena",
  "Jin", "Zara", "Felix", "Maya", "Andre", "Thandi",
];
const LAST = [
  "Rivera", "Chen", "Okafor", "Nguyen", "Patel", "Kim", "Silva", "Haddad",
  "Larsson", "Tanaka", "Mbeki", "Rossi", "Novak", "Costa", "Ahmed", "Müller",
  "Santos", "Khan", "Andersson", "Diallo",
];
const COUNTRIES = [
  "🇺🇸 USA", "🇮🇳 India", "🇧🇷 Brazil", "🇰🇪 Kenya", "🇮🇩 Indonesia",
  "🇩🇪 Germany", "🇯🇵 Japan", "🇬🇧 UK", "🇳🇬 Nigeria", "🇸🇪 Sweden",
  "🇲🇽 Mexico", "🇦🇺 Australia", "🇿🇦 South Africa", "🇫🇷 France", "🇨🇦 Canada",
];
const ORGS = [
  "Stanford University", "MIT", "Greenpeace", "Patagonia", "TU Delft",
  "Univ. of Nairobi", "Google", "Microsoft", "WWF", "IIT Bombay", null, null,
];
const BIOS = [
  "Restoring my corner of the planet, one action at a time. 🌍",
  "Weekend tree planter. Full-time optimist.",
  "Ocean cleanup volunteer & zero-waste nerd.",
  "Believer in small actions, big impact.",
  "Building a greener future with my community.",
  "Climate action is the new social.",
];

function statsFromScale(rng: () => number, scale: number): ProfileStats {
  const r = (min: number, max: number) => min + (max - min) * rng();
  return {
    treesPlanted: Math.round(r(20, 1200) * scale),
    co2OffsetKg: Math.round(r(500, 40000) * scale),
    plasticRemovedKg: Math.round(r(10, 500) * scale),
    donationsUsd: Math.round(r(50, 4000) * scale),
    volunteerHours: Math.round(r(10, 300) * scale),
    recycleKg: Math.round(r(30, 1500) * scale),
    challengesCompleted: Math.round(r(20, 600) * scale),
    lessonsCompleted: Math.round(r(5, 120) * scale),
    ecoPoints: 0,
    streakDays: Math.round(r(3, 220) * Math.min(1, scale + 0.3)),
  };
}

function makeProfile(seed: number, scale: number): Profile {
  const rng = mulberry32(seed);
  const fn = FIRST[Math.floor(rng() * FIRST.length)];
  const ln = LAST[Math.floor(rng() * LAST.length)];
  const stats = statsFromScale(rng, scale);
  stats.ecoPoints = computeEcoScore(stats);
  const hueRng = mulberry32(seed * 7 + 3);
  const idChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pid = "VER-";
  const pidRng = mulberry32(seed * 13 + 1);
  for (let i = 0; i < 6; i++) pid += idChars[Math.floor(pidRng() * idChars.length)];

  return {
    id: `seed-${seed}`,
    planetId: pid,
    username: `${fn.toLowerCase()}${ln.toLowerCase()}${seed % 100}`,
    displayName: `${fn} ${ln}`,
    avatarHue: Math.floor(hueRng() * 360),
    bio: BIOS[seed % BIOS.length],
    location: null,
    country: COUNTRIES[seed % COUNTRIES.length],
    org: ORGS[seed % ORGS.length],
    joinedAt: "2025-09-14",
    stats,
    followers: Math.round(stats.ecoPoints / 12),
    following: Math.round(stats.ecoPoints / 40),
    badgeIds: evaluateBadges(stats),
  };
}

/* ----- The signed-in demo user --------------------------------------------- */

const demoStats: ProfileStats = {
  treesPlanted: 420,
  co2OffsetKg: 13500,
  plasticRemovedKg: 180,
  donationsUsd: 1250,
  volunteerHours: 160,
  recycleKg: 640,
  challengesCompleted: 240,
  lessonsCompleted: 64,
  ecoPoints: 0,
  streakDays: 41,
};
demoStats.ecoPoints = computeEcoScore(demoStats);

export const DEMO_PROFILE: Profile = {
  id: "demo-user",
  planetId: "VER-582931",
  username: "alexrivera",
  displayName: "Alex Rivera",
  avatarHue: 152,
  bio: "Citizen of a greener Earth. Planting, recycling, and racing up the leaderboard. 🌱",
  location: "San Francisco",
  country: "🇺🇸 USA",
  org: "Stanford University",
  joinedAt: "2025-03-12",
  stats: demoStats,
  followers: 1284,
  following: 326,
  badgeIds: evaluateBadges(demoStats),
};

/* ----- Generated cohorts --------------------------------------------------- */

// World-elite (leaderboard top); high scales so they outrank the demo user.
export const TOP_PROFILES: Profile[] = Array.from({ length: 24 }, (_, i) =>
  makeProfile(1000 + i, 3.2 - i * 0.09),
);

// Users near the demo user's global rank (#1832) — for the "nearby" view.
export const NEARBY_PROFILES: Profile[] = Array.from({ length: 4 }, (_, i) =>
  makeProfile(5000 + i, 1.0 + (i - 2) * 0.03),
);

export const ALL_PROFILES: Profile[] = [
  DEMO_PROFILE,
  ...TOP_PROFILES,
  ...NEARBY_PROFILES,
];

/* ----- Lookups ------------------------------------------------------------- */

export function getProfileByPlanetId(planetId: string): Profile | undefined {
  const norm = planetId.trim().toUpperCase();
  return ALL_PROFILES.find((p) => p.planetId.toUpperCase() === norm);
}

export function searchProfiles(query: string): Profile[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_PROFILES.filter(
    (p) =>
      p.planetId.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q),
  ).slice(0, 8);
}

/* ----- Leaderboards -------------------------------------------------------- */

const CATEGORY_META: Record<
  LeaderboardCategory,
  { unit: string; value: (p: Profile) => number }
> = {
  ecoScore: { unit: "pts", value: (p) => computeEcoScore(p.stats) },
  trees: { unit: "trees", value: (p) => p.stats.treesPlanted },
  co2: { unit: "kg CO₂", value: (p) => p.stats.co2OffsetKg },
  plastic: { unit: "kg", value: (p) => p.stats.plasticRemovedKg },
  donations: { unit: "USD", value: (p) => p.stats.donationsUsd },
  volunteer: { unit: "hrs", value: (p) => p.stats.volunteerHours },
  streak: { unit: "days", value: (p) => p.stats.streakDays },
  earthHealth: {
    unit: "%",
    value: (p) => {
      const s = computeEcoScore(p.stats);
      return Math.round((1 - Math.pow(1 - Math.min(1, s / 70000), 1.7)) * 100);
    },
  },
};

export function getLeaderboard(
  category: LeaderboardCategory = "ecoScore",
): LeaderboardEntry[] {
  const meta = CATEGORY_META[category];
  return [...TOP_PROFILES]
    .sort((a, b) => meta.value(b) - meta.value(a))
    .map((p, i) => ({
      rank: i + 1,
      planetId: p.planetId,
      displayName: p.displayName,
      username: p.username,
      avatarHue: p.avatarHue,
      country: p.country,
      level: getLevel(computeEcoScore(p.stats)).name,
      value: meta.value(p),
      unit: meta.unit,
    }));
}

/* ----- Global rank (demo user) -------------------------------------------- */

export const GLOBAL_RANK: GlobalRank = {
  rank: 1832,
  total: 58241,
  percentile: 3.1,
  movement: 148,
  toNextRank: 37,
};

export function nearbyRankRows(): LeaderboardEntry[] {
  const rows: LeaderboardEntry[] = NEARBY_PROFILES.map((p, i) => ({
    rank: 1830 + (i >= 2 ? i + 1 : i),
    planetId: p.planetId,
    displayName: p.displayName,
    username: p.username,
    avatarHue: p.avatarHue,
    country: p.country,
    level: getLevel(computeEcoScore(p.stats)).name,
    value: computeEcoScore(p.stats),
    unit: "pts",
  }));
  rows.splice(2, 0, {
    rank: 1832,
    planetId: DEMO_PROFILE.planetId,
    displayName: DEMO_PROFILE.displayName,
    username: DEMO_PROFILE.username,
    avatarHue: DEMO_PROFILE.avatarHue,
    country: DEMO_PROFILE.country,
    level: getLevel(computeEcoScore(DEMO_PROFILE.stats)).name,
    value: computeEcoScore(DEMO_PROFILE.stats),
    unit: "pts",
  });
  return rows;
}

/* ----- Activity feed, challenges, graphs, global stats --------------------- */

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: "a1", actorPlanetId: TOP_PROFILES[3].planetId, actorName: "Sarah Chen", actorHue: 180, verb: "planted", detail: "planted 5 trees in the Amazon Headwaters", createdAt: "2m" },
  { id: "a2", actorPlanetId: TOP_PROFILES[1].planetId, actorName: "Alex Okafor", actorHue: 90, verb: "recycled", detail: "recycled 12 kg of plastic", createdAt: "9m" },
  { id: "a3", actorPlanetId: TOP_PROFILES[6].planetId, actorName: "Michael Kim", actorHue: 250, verb: "leveled_up", detail: "reached Level — Planet Protector", createdAt: "21m" },
  { id: "a4", actorPlanetId: TOP_PROFILES[2].planetId, actorName: "Priya Patel", actorHue: 320, verb: "earned_badge", detail: "unlocked the Ocean Saver badge 🐢", createdAt: "34m" },
  { id: "a5", actorPlanetId: TOP_PROFILES[8].planetId, actorName: "Diego Silva", actorHue: 40, verb: "completed_challenge", detail: "completed today's Bike-to-Work challenge", createdAt: "1h" },
  { id: "a6", actorPlanetId: TOP_PROFILES[5].planetId, actorName: "Mei Nguyen", actorHue: 160, verb: "donated", detail: "donated to the Borneo Peat project", createdAt: "2h" },
  { id: "a7", actorPlanetId: TOP_PROFILES[11].planetId, actorName: "Noah Larsson", actorHue: 210, verb: "volunteered", detail: "volunteered 4 hours at a beach cleanup", createdAt: "3h" },
];

export const FRIENDS_TODAY = [
  "Your friends planted 42 trees today 🌳",
  "Sarah completed the Ocean Cleanup challenge 🌊",
  "Alex reached Level 6 — Planet Protector ⭐",
  "John unlocked the Forest Guardian badge 🌳",
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: "c1", title: "Recycle a plastic bottle", description: "Log one recycled bottle today.", type: "recycle", rewardXp: 40, rewardCoins: 10, done: true },
  { id: "c2", title: "Bike instead of driving", description: "Swap one car trip for a bike ride.", type: "volunteer", rewardXp: 80, rewardCoins: 20, done: false },
  { id: "c3", title: "Plant a sapling", description: "Plant one sapling and tag it.", type: "tree", rewardXp: 120, rewardCoins: 30, done: false },
  { id: "c4", title: "Complete the climate quiz", description: "Score 80%+ on today's quiz.", type: "education", rewardXp: 60, rewardCoins: 15, done: false },
];

export const MONTHLY_CONTRIB: MonthlyPoint[] = [
  { label: "Jan", value: 1240 }, { label: "Feb", value: 1680 },
  { label: "Mar", value: 1520 }, { label: "Apr", value: 2240 },
  { label: "May", value: 2980 }, { label: "Jun", value: 3460 },
  { label: "Jul", value: 3120 }, { label: "Aug", value: 3880 },
  { label: "Sep", value: 4220 }, { label: "Oct", value: 4760 },
  { label: "Nov", value: 5180 }, { label: "Dec", value: 5640 },
];

// Mon..Sun activity points (eco-points earned per day this week)
export const WEEKLY_ACTIVITY: MonthlyPoint[] = [
  { label: "M", value: 220 }, { label: "T", value: 380 },
  { label: "W", value: 140 }, { label: "T", value: 460 },
  { label: "F", value: 300 }, { label: "S", value: 540 },
  { label: "S", value: 410 },
];

export const GLOBAL_STATS: GlobalStats = {
  trees: 2148920,
  co2Tonnes: 184230,
  plasticTonnes: 9420,
  countries: 142,
  users: 58241,
  online: 3187,
};

export const MILESTONES = [
  { label: "Planted 100 trees", done: true },
  { label: "Reached a 30-day streak", done: true },
  { label: "Offset 10 tonnes of CO₂", done: true },
  { label: "Reach Climate Champion", done: false },
  { label: "Break into the global Top 1,000", done: false },
];
