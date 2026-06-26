/**
 * Core domain types for Verdana.
 * These mirror the Prisma schema in /prisma/schema.prisma so the mock data
 * layer can be swapped for a real database without touching the UI.
 */

export type TreeStatus =
  | "ordered" // paid for, not yet planted
  | "planted" // in the ground, GPS-tagged
  | "growing" // verified alive in latest monitoring pass
  | "at_risk" // flagged by satellite/ML monitoring
  | "lost"; // confirmed lost (will be replanted)

export interface PlantingLocation {
  id: string;
  name: string;
  country: string;
  region: string;
  biome: string;
  lat: number;
  lon: number;
  pricePerTree: number; // USD
  species: string[];
  description: string;
  /** Tailwind gradient classes used for the card artwork (self-contained, no remote images). */
  artwork: string;
  treesNeeded: number;
  treesPlanted: number;
  partner: string;
}

export interface TreeRecord {
  treeId: string;
  userId: string;
  locationId: string;
  projectId: string;
  species: string;
  status: TreeStatus;
  lat: number;
  lon: number;
  plantedAt: string | null; // ISO date
  photoUrl: string | null;
  heightCm: number;
  carbonKg: number; // cumulative CO2 sequestered estimate
}

/** V1 (legacy) badge — used only by the original commerce pages. */
export interface LegacyBadge {
  badgeId: string;
  name: string;
  description: string;
  achieved: boolean;
}

export interface UserStats {
  userId: string;
  displayName: string;
  totalTrees: number;
  totalCarbonKg: number;
  forestAreaM2: number;
  survivalRate: number; // 0..1
  streakDays: number;
  badges: LegacyBadge[];
}

export interface CartItem {
  locationId: string;
  quantity: number;
}

/* ===========================================================================
 * V2 — Community platform domain
 * ======================================================================== */

export type ContributionType =
  | "tree"
  | "plastic"
  | "donation"
  | "volunteer"
  | "recycle"
  | "challenge"
  | "education";

export interface Contribution {
  id: string;
  userId: string;
  type: ContributionType;
  /** Magnitude in the type's natural unit (trees, kg, USD, hours, count). */
  amount: number;
  co2Kg: number;
  ecoPoints: number;
  note?: string;
  createdAt: string; // ISO
}

/** Raw, additive tallies that everything else is derived from. */
export interface ProfileStats {
  treesPlanted: number;
  co2OffsetKg: number;
  plasticRemovedKg: number;
  donationsUsd: number;
  volunteerHours: number;
  recycleKg: number;
  challengesCompleted: number;
  lessonsCompleted: number;
  ecoPoints: number;
  streakDays: number;
}

export interface Profile {
  id: string;
  planetId: string; // VER-XXXXXX
  username: string;
  displayName: string;
  avatarHue: number; // 0..360 — drives a deterministic gradient avatar
  bio: string;
  location: string | null;
  country: string;
  org?: string | null; // university / company
  joinedAt: string; // ISO
  stats: ProfileStats;
  followers: number;
  following: number;
  badgeIds: string[];
}

export type BadgeTier = "bronze" | "silver" | "gold" | "elite";

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tier: BadgeTier;
}

export interface LevelInfo {
  index: number;
  name: string;
  /** eco-score required to enter this level */
  minScore: number;
  /** eco-score required for the next level (null if max) */
  nextScore: number | null;
  /** 0..1 progress toward the next level */
  progress: number;
  accent: string; // tailwind color hint for theming
}

export interface EarthStage {
  threshold: number; // health % at which this stage begins
  key: string;
  title: string;
  description: string;
}

export type LeaderboardCategory =
  | "ecoScore"
  | "trees"
  | "co2"
  | "plastic"
  | "donations"
  | "volunteer"
  | "streak"
  | "earthHealth";

export type LeaderboardPeriod = "week" | "month" | "year" | "all";

export interface LeaderboardEntry {
  rank: number;
  planetId: string;
  displayName: string;
  username: string;
  avatarHue: number;
  country: string;
  level: string;
  value: number;
  unit: string;
}

export interface GlobalRank {
  rank: number;
  total: number;
  percentile: number; // top X%
  movement: number; // +/- since last period
  toNextRank: number; // eco-score points to climb one rank
}

export type ActivityVerb =
  | "planted"
  | "recycled"
  | "donated"
  | "volunteered"
  | "leveled_up"
  | "earned_badge"
  | "completed_challenge"
  | "joined";

export interface ActivityItem {
  id: string;
  actorPlanetId: string;
  actorName: string;
  actorHue: number;
  verb: ActivityVerb;
  detail: string;
  createdAt: string; // ISO
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: ContributionType;
  rewardXp: number;
  rewardCoins: number;
  done: boolean;
}

export interface MonthlyPoint {
  label: string; // "Jan"
  value: number;
}

export interface GlobalStats {
  trees: number;
  co2Tonnes: number;
  plasticTonnes: number;
  countries: number;
  users: number;
  online: number;
}

export interface FeedComment {
  id: string;
  authorName: string;
  authorHue: number;
  authorPlanetId: string;
  body: string;
  createdAt: string; // display label e.g. "2h", "now"
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorHue: number;
  authorPlanetId: string;
  body: string;
  hashtags: string[];
  likes: number;
  likedByMe: boolean;
  comments: FeedComment[];
  createdAt: string; // display label e.g. "2h", "now"
}

