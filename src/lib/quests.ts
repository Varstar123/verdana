import type { Quest, QuestTask } from "@/lib/types";

/**
 * Quests & tasks — the playful, do-it-at-home side of Verdana.
 *
 * Every upload pays out in two things:
 *   • Green Coins 🪙 — your in-app money. Bank enough and Verdana plants a
 *     REAL tree with a partner project (see {@link COINS_PER_REAL_TREE}).
 *   • Sprout Points ✨ — feel-good progress points for the fun of it.
 *
 * This module is pure data + helpers (no server/`window` access), so it can be
 * imported from both server pages and client components. It is the single
 * source of truth for the task list, the quests and the coin economy.
 */

/* ----- The in-app economy -------------------------------------------------- */

/** Green Coins needed to fund one real, partner-planted tree. */
export const COINS_PER_REAL_TREE = 500;

export interface RealTreeProject {
  id: string;
  name: string;
  country: string;
  emoji: string;
  blurb: string;
}

/** Partner projects your coins can fund (mirrors the planting locations). */
export const REAL_TREE_PROJECTS: RealTreeProject[] = [
  {
    id: "loc-amazon",
    name: "Amazon Headwaters",
    country: "Brazil 🇧🇷",
    emoji: "🌴",
    blurb: "Rebuild rainforest canopy corridors for wildlife.",
  },
  {
    id: "loc-kenya",
    name: "Great Rift Highlands",
    country: "Kenya 🇰🇪",
    emoji: "⛰️",
    blurb: "Community watershed restoration for smallholder farms.",
  },
  {
    id: "loc-madagascar",
    name: "Mangrove Coastline",
    country: "Madagascar 🇲🇬",
    emoji: "🌊",
    blurb: "Plant mangroves that lock away precious blue carbon.",
  },
];

/** How many whole real trees a coin balance is worth. */
export function treesFromCoins(coins: number): number {
  return Math.floor(coins / COINS_PER_REAL_TREE);
}

/* ----- Daily tasks (reset every day) -------------------------------------- */

export const DAILY_TASKS: QuestTask[] = [
  {
    id: "t-water",
    title: "Water a plant",
    description: "Give a thirsty plant a drink and snap the moment. 💧",
    emoji: "💧",
    proof: "photo",
    rewardCoins: 25,
    rewardXp: 50,
    type: "tree",
  },
  {
    id: "t-plant",
    title: "Plant a new sapling",
    description: "Pop a seed or sapling into some soil and photograph it. 🌱",
    emoji: "🌱",
    proof: "photo",
    rewardCoins: 60,
    rewardXp: 120,
    type: "tree",
  },
  {
    id: "t-buddy",
    title: "Snap your plant buddy",
    description: "Take a photo of a plant you're growing at home. 🪴",
    emoji: "🪴",
    proof: "photo",
    rewardCoins: 20,
    rewardXp: 40,
    type: "tree",
  },
  {
    id: "t-recycle",
    title: "Recycle something",
    description: "Sort a bottle, can or carton into recycling. ♻️",
    emoji: "♻️",
    proof: "photo",
    rewardCoins: 25,
    rewardXp: 50,
    type: "recycle",
  },
  {
    id: "t-meal",
    title: "Eat a plant-based meal",
    description: "Cook something green and show off your plate. 🥗",
    emoji: "🥗",
    proof: "photo",
    rewardCoins: 30,
    rewardXp: 60,
    type: "education",
  },
  {
    id: "t-litter",
    title: "Pick up 3 pieces of litter",
    description: "Grab a little litter on your walk and bin it. 🧤",
    emoji: "🧤",
    proof: "photo",
    rewardCoins: 35,
    rewardXp: 70,
    type: "plastic",
  },
];

/* ----- Multi-step quests --------------------------------------------------- */

export const QUESTS: Quest[] = [
  {
    id: "q-grow",
    title: "Grow-a-Tree Journey",
    description: "Raise a plant from seed to sprout — one photo at a time.",
    emoji: "🌳",
    accent: "#22A155",
    steps: [
      { id: "s1", title: "Plant your seed", emoji: "🌰", rewardCoins: 50, rewardXp: 80 },
      { id: "s2", title: "Give it water & light", emoji: "💧", rewardCoins: 40, rewardXp: 60 },
      { id: "s3", title: "Show the first sprout", emoji: "🌱", rewardCoins: 60, rewardXp: 100 },
    ],
    bonusCoins: 150,
    bonusXp: 200,
    reward: "Sprout Gardener badge 🌱",
  },
  {
    id: "q-balcony",
    title: "Balcony Garden Builder",
    description: "Turn a windowsill or balcony into a tiny green oasis.",
    emoji: "🪴",
    accent: "#2DD4BF",
    steps: [
      { id: "s1", title: "Pot your first plant", emoji: "🪴", rewardCoins: 40, rewardXp: 60 },
      { id: "s2", title: "Add two more green friends", emoji: "🌿", rewardCoins: 50, rewardXp: 80 },
      { id: "s3", title: "Photograph your green corner", emoji: "📸", rewardCoins: 60, rewardXp: 100 },
    ],
    bonusCoins: 180,
    bonusXp: 220,
    reward: "Urban Jungle badge 🌿",
  },
  {
    id: "q-cleanup",
    title: "Neighborhood Cleanup",
    description: "Leave your street greener than you found it.",
    emoji: "♻️",
    accent: "#22D3EE",
    steps: [
      { id: "s1", title: "Collect a bag of litter", emoji: "🧹", rewardCoins: 50, rewardXp: 80 },
      { id: "s2", title: "Sort it for recycling", emoji: "♻️", rewardCoins: 50, rewardXp: 80 },
    ],
    bonusCoins: 120,
    bonusXp: 160,
    reward: "Street Hero badge 🦸",
  },
  {
    id: "q-pollinator",
    title: "Pollinator Friend",
    description: "Help the bees and butterflies that keep our planet blooming.",
    emoji: "🐝",
    accent: "#E3B341",
    steps: [
      { id: "s1", title: "Plant a flower", emoji: "🌼", rewardCoins: 50, rewardXp: 80 },
      { id: "s2", title: "Spot a bee or butterfly", emoji: "🦋", rewardCoins: 60, rewardXp: 100 },
    ],
    bonusCoins: 140,
    bonusXp: 180,
    reward: "Pollinator Pal badge 🐝",
  },
];

export function findTask(id: string): QuestTask | undefined {
  return DAILY_TASKS.find((t) => t.id === id);
}

export function findQuest(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

/** Friendly mascot lines shown after a successful upload. */
export const MASCOT_CHEERS = [
  "Sprout is so proud of you! 🌱",
  "That's another win for the planet! 🌍",
  "Look at you go, eco-hero! ✨",
  "The Earth just smiled a little. 😊",
  "Tiny action, real impact — keep going! 💚",
];

/* ----- Wallet (persisted per user) ---------------------------------------- */

export interface QuestWallet {
  coins: number; // spendable in-app money
  xp: number; // lifetime Sprout Points
  treesFunded: number; // real trees funded by redeeming coins
  dailyDone: Record<string, string[]>; // day key -> completed daily-task ids
  questSteps: Record<string, string[]>; // questId -> completed step ids
  questsBonus: string[]; // questIds whose finishing bonus was claimed
}

export function emptyWallet(): QuestWallet {
  return { coins: 0, xp: 0, treesFunded: 0, dailyDone: {}, questSteps: {}, questsBonus: [] };
}

/**
 * Day key used to reset daily tasks. Based on IST (UTC+5:30) so tasks roll over
 * at local midnight in India. Server and client compute this identically, so
 * they always agree on which day "today" is.
 */
const IST_OFFSET_MIN = 330;
export function questDayKey(): string {
  return new Date(Date.now() + IST_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
}
