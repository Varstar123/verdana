import type {
  Badge,
  EarthStage,
  LevelInfo,
  ProfileStats,
} from "@/lib/types";

/* ---------------------------------------------------------------------------
 * Eco-score
 * The single number that ranks users. Deliberately rewards *breadth* of action
 * (volunteering, recycling, learning, streaks) — not just donations — so the
 * platform feels like participation, not charity.
 * ------------------------------------------------------------------------- */

export const ECO_WEIGHTS = {
  tree: 12, // per tree planted
  co2: 0.4, // per kg CO2 offset
  plastic: 6, // per kg plastic removed
  donation: 1.5, // per USD donated
  volunteer: 25, // per hour volunteered
  recycle: 4, // per kg recycled
  challenge: 15, // per challenge completed
  lesson: 10, // per lesson completed
  streak: 8, // per day of current streak
} as const;

export function computeEcoScore(s: ProfileStats): number {
  const raw =
    s.treesPlanted * ECO_WEIGHTS.tree +
    s.co2OffsetKg * ECO_WEIGHTS.co2 +
    s.plasticRemovedKg * ECO_WEIGHTS.plastic +
    s.donationsUsd * ECO_WEIGHTS.donation +
    s.volunteerHours * ECO_WEIGHTS.volunteer +
    s.recycleKg * ECO_WEIGHTS.recycle +
    s.challengesCompleted * ECO_WEIGHTS.challenge +
    s.lessonsCompleted * ECO_WEIGHTS.lesson +
    s.streakDays * ECO_WEIGHTS.streak;
  return Math.round(raw);
}

/* ---------------------------------------------------------------------------
 * Levels — Seed → Legend of Verdana
 * ------------------------------------------------------------------------- */

export const LEVELS: { name: string; minScore: number; accent: string }[] = [
  { name: "Seed", minScore: 0, accent: "#A0AEC0" },
  { name: "Sapling", minScore: 500, accent: "#6FCB8E" },
  { name: "Gardener", minScore: 1500, accent: "#43B86E" },
  { name: "Forest Ranger", minScore: 4000, accent: "#22A155" },
  { name: "Earth Guardian", minScore: 9000, accent: "#2DD4BF" },
  { name: "Planet Protector", minScore: 18000, accent: "#22D3EE" },
  { name: "Climate Champion", minScore: 35000, accent: "#8B5CF6" },
  { name: "Legend of Verdana", minScore: 70000, accent: "#EC4899" },
];

/** What each level unlocks (aligned by index to LEVELS). */
export const LEVEL_REWARDS: { perks: string[] }[] = [
  { perks: ["Starter Earth", "Default profile theme"] },
  { perks: ["Sapling badge", "Sprout avatar ring"] },
  { perks: ["Forest theme", "Wildflowers on your Earth"] },
  { perks: ["Ranger profile frame", "Returning wildlife on your Earth"] },
  { perks: ["Aurora theme", "Glacier recovery Earth upgrade"] },
  { perks: ["Protector decoration", "City lights on your night side"] },
  { perks: ["Champion gold frame", "Lush rainforest Earth upgrade"] },
  { perks: ["Legendary aura", "Dream Earth (max bloom)", "Exclusive Legend theme"] },
];

export function getLevel(ecoScore: number): LevelInfo {
  let index = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (ecoScore >= LEVELS[i].minScore) {
      index = i;
      break;
    }
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const span = next ? next.minScore - current.minScore : 1;
  const into = ecoScore - current.minScore;
  const progress = next ? Math.min(1, Math.max(0, into / span)) : 1;

  return {
    index,
    name: current.name,
    minScore: current.minScore,
    nextScore: next ? next.minScore : null,
    progress,
    accent: current.accent,
  };
}

/* ---------------------------------------------------------------------------
 * Earth health (0..100) + growth stages
 * Health uses a diminishing-returns curve so early actions feel impactful and
 * the final stages remain aspirational.
 * ------------------------------------------------------------------------- */

const HEALTH_FULL_SCORE = 70000; // eco-score that maps to ~100% health

export function computeEarthHealth(ecoScore: number): number {
  const t = Math.min(1, ecoScore / HEALTH_FULL_SCORE);
  // ease-out curve
  const eased = 1 - Math.pow(1 - t, 1.7);
  return Math.round(eased * 100);
}

export const EARTH_STAGES: EarthStage[] = [
  {
    threshold: 0,
    key: "barren",
    title: "Barren World",
    description: "A grey, lifeless planet waiting for its first spark of green.",
  },
  {
    threshold: 10,
    key: "first-forests",
    title: "First Forests",
    description: "Scattered patches of green break through the dust.",
  },
  {
    threshold: 30,
    key: "green-continents",
    title: "Green Continents",
    description: "Continents turn verdant as forests spread.",
  },
  {
    threshold: 50,
    key: "healthy-oceans",
    title: "Healthy Oceans",
    description: "Oceans clear to a deep, living blue.",
  },
  {
    threshold: 70,
    key: "wildlife-returns",
    title: "Wildlife Returns",
    description: "Ecosystems flourish; life returns to land and sea.",
  },
  {
    threshold: 90,
    key: "lush-earth",
    title: "Lush Earth",
    description: "Glaciers recover and skies run clear.",
  },
  {
    threshold: 100,
    key: "dream-earth",
    title: "Dream Earth",
    description: "The planet at its most radiant — your masterpiece.",
  },
];

export function getEarthStage(health: number): {
  stage: EarthStage;
  index: number;
  next: EarthStage | null;
} {
  let index = 0;
  for (let i = EARTH_STAGES.length - 1; i >= 0; i--) {
    if (health >= EARTH_STAGES[i].threshold) {
      index = i;
      break;
    }
  }
  return {
    stage: EARTH_STAGES[index],
    index,
    next: EARTH_STAGES[index + 1] ?? null,
  };
}

/* ---------------------------------------------------------------------------
 * Badges
 * ------------------------------------------------------------------------- */

export const BADGES: (Badge & { test: (s: ProfileStats) => boolean })[] = [
  {
    id: "first-tree",
    name: "First Tree",
    emoji: "🌱",
    tier: "bronze",
    description: "Plant your first tree.",
    test: (s) => s.treesPlanted >= 1,
  },
  {
    id: "forest-guardian",
    name: "Forest Guardian",
    emoji: "🌳",
    tier: "silver",
    description: "Plant 100 trees.",
    test: (s) => s.treesPlanted >= 100,
  },
  {
    id: "recycling-hero",
    name: "Recycling Hero",
    emoji: "♻️",
    tier: "silver",
    description: "Recycle 50 kg of material.",
    test: (s) => s.recycleKg >= 50,
  },
  {
    id: "ocean-saver",
    name: "Ocean Saver",
    emoji: "🐢",
    tier: "silver",
    description: "Remove 25 kg of plastic.",
    test: (s) => s.plasticRemovedKg >= 25,
  },
  {
    id: "earth-protector",
    name: "Earth Protector",
    emoji: "🌎",
    tier: "gold",
    description: "Offset one tonne of CO₂.",
    test: (s) => s.co2OffsetKg >= 1000,
  },
  {
    id: "streak-100",
    name: "100 Day Streak",
    emoji: "🔥",
    tier: "gold",
    description: "Maintain a 100-day streak.",
    test: (s) => s.streakDays >= 100,
  },
  {
    id: "volunteer-star",
    name: "Volunteer Star",
    emoji: "⭐",
    tier: "gold",
    description: "Volunteer 50 hours.",
    test: (s) => s.volunteerHours >= 50,
  },
  {
    id: "scholar",
    name: "Eco Scholar",
    emoji: "📚",
    tier: "bronze",
    description: "Complete 20 lessons.",
    test: (s) => s.lessonsCompleted >= 20,
  },
  {
    id: "elite-guardian",
    name: "Elite Guardian",
    emoji: "💎",
    tier: "elite",
    description: "Reach an eco-score of 35,000.",
    test: (s) => computeEcoScore(s) >= 35000,
  },
];

export function evaluateBadges(s: ProfileStats): string[] {
  return BADGES.filter((b) => b.test(s)).map((b) => b.id);
}

export function getBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

/* ---------------------------------------------------------------------------
 * Formatting helpers
 * ------------------------------------------------------------------------- */

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("en-US");
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
