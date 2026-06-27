import type {
  LegacyBadge,
  PlantingLocation,
  TreeRecord,
  UserStats,
} from "@/lib/types";

/**
 * In-memory mock data layer for the scaffold.
 *
 * Every function here is the seam where a real database (Prisma + PostgreSQL
 * with PostGIS) would plug in. The UI and API routes call these helpers only,
 * so swapping to a live DB is a localized change.
 */

export const locations: PlantingLocation[] = [
  {
    id: "loc-amazon",
    name: "Amazon Headwaters",
    country: "Brazil",
    region: "Acre",
    biome: "Tropical Rainforest",
    lat: -9.97,
    lon: -67.81,
    pricePerTree: 14,
    species: ["Brazil Nut", "Mahogany", "Açaí Palm"],
    description:
      "Restoring degraded cattle pasture at the headwaters of the Amazon, rebuilding canopy corridors for wildlife.",
    artwork: "from-forest-700 via-forest-600 to-forest-400",
    treesNeeded: 120000,
    treesPlanted: 84210,
    partner: "Acre Reforestation Collective",
  },
  {
    id: "loc-kenya",
    name: "Great Rift Highlands",
    country: "Kenya",
    region: "Rift Valley",
    biome: "Montane Forest",
    lat: -0.52,
    lon: 35.27,
    pricePerTree: 11,
    species: ["African Olive", "Cape Chestnut", "Croton"],
    description:
      "Community-led watershed restoration that secures water supply for smallholder farms downstream.",
    artwork: "from-bark-dark via-bark to-forest-500",
    treesNeeded: 90000,
    treesPlanted: 41980,
    partner: "Rift Valley Greenbelt",
  },
  {
    id: "loc-borneo",
    name: "Borneo Lowland Peat",
    country: "Indonesia",
    region: "Central Kalimantan",
    biome: "Peat Swamp Forest",
    lat: -2.21,
    lon: 113.92,
    pricePerTree: 18,
    species: ["Ramin", "Jelutung", "Meranti"],
    description:
      "Rewetting and replanting drained peatland — among the highest-carbon ecosystems on Earth.",
    artwork: "from-forest-800 via-forest-700 to-sky",
    treesNeeded: 60000,
    treesPlanted: 12300,
    partner: "Kalimantan Peat Alliance",
  },
  {
    id: "loc-scotland",
    name: "Caledonian Glens",
    country: "Scotland",
    region: "Highlands",
    biome: "Temperate Rainforest",
    lat: 57.12,
    lon: -4.71,
    pricePerTree: 16,
    species: ["Scots Pine", "Silver Birch", "Rowan"],
    description:
      "Regenerating fragments of the ancient Caledonian forest with native, climate-resilient species.",
    artwork: "from-forest-600 via-sage to-ivory",
    treesNeeded: 45000,
    treesPlanted: 38770,
    partner: "Highland Rewilding Trust",
  },
  {
    id: "loc-california",
    name: "Sierra Nevada Burn Scar",
    country: "United States",
    region: "California",
    biome: "Temperate Conifer",
    lat: 38.74,
    lon: -120.16,
    pricePerTree: 20,
    species: ["Giant Sequoia", "Ponderosa Pine", "Incense Cedar"],
    description:
      "Replanting wildfire-scarred slopes with fire-adapted natives to restore habitat and watershed.",
    artwork: "from-bark via-forest-500 to-forest-300",
    treesNeeded: 75000,
    treesPlanted: 22640,
    partner: "Sierra Restoration Project",
  },
  {
    id: "loc-madagascar",
    name: "Mangrove Coastline",
    country: "Madagascar",
    region: "Menabe",
    biome: "Coastal Mangrove",
    lat: -20.28,
    lon: 44.27,
    pricePerTree: 12,
    species: ["Red Mangrove", "Black Mangrove"],
    description:
      "Mangrove restoration that buffers coastal villages from storms and locks away blue carbon.",
    artwork: "from-sky via-forest-500 to-forest-700",
    treesNeeded: 100000,
    treesPlanted: 67500,
    partner: "Menabe Blue Carbon",
  },
];

const DEMO_USER_ID = "user-demo";

const demoBadges: LegacyBadge[] = [
  {
    badgeId: "first-tree",
    name: "First Sapling",
    description: "Planted your very first tree.",
    achieved: true,
  },
  {
    badgeId: "ten-trees",
    name: "Grove Keeper",
    description: "Reached 10 trees in your forest.",
    achieved: true,
  },
  {
    badgeId: "three-biomes",
    name: "Biome Explorer",
    description: "Planted across 3 different ecosystems.",
    achieved: true,
  },
  {
    badgeId: "carbon-ton",
    name: "First Tonne",
    description: "Sequestered your first tonne of CO₂.",
    achieved: false,
  },
  {
    badgeId: "fifty-trees",
    name: "Forest Steward",
    description: "Reach 50 trees in your forest.",
    achieved: false,
  },
];

const demoTrees: TreeRecord[] = [
  {
    treeId: "vd-100231",
    userId: DEMO_USER_ID,
    locationId: "loc-amazon",
    projectId: "prj-acre-01",
    species: "Brazil Nut",
    status: "growing",
    lat: -9.9712,
    lon: -67.8101,
    plantedAt: "2025-03-12",
    photoUrl: null,
    heightCm: 142,
    carbonKg: 28.4,
  },
  {
    treeId: "vd-100232",
    userId: DEMO_USER_ID,
    locationId: "loc-amazon",
    projectId: "prj-acre-01",
    species: "Mahogany",
    status: "growing",
    lat: -9.9718,
    lon: -67.8109,
    plantedAt: "2025-03-12",
    photoUrl: null,
    heightCm: 118,
    carbonKg: 22.1,
  },
  {
    treeId: "vd-100410",
    userId: DEMO_USER_ID,
    locationId: "loc-kenya",
    projectId: "prj-rift-04",
    species: "Cape Chestnut",
    status: "planted",
    lat: -0.5211,
    lon: 35.2702,
    plantedAt: "2025-09-01",
    photoUrl: null,
    heightCm: 64,
    carbonKg: 6.8,
  },
  {
    treeId: "vd-100411",
    userId: DEMO_USER_ID,
    locationId: "loc-scotland",
    projectId: "prj-cale-02",
    species: "Scots Pine",
    status: "at_risk",
    lat: 57.1209,
    lon: -4.7112,
    plantedAt: "2025-04-22",
    photoUrl: null,
    heightCm: 51,
    carbonKg: 4.2,
  },
  {
    treeId: "vd-100412",
    userId: DEMO_USER_ID,
    locationId: "loc-madagascar",
    projectId: "prj-mng-07",
    species: "Red Mangrove",
    status: "ordered",
    lat: -20.281,
    lon: 44.2711,
    plantedAt: null,
    photoUrl: null,
    heightCm: 0,
    carbonKg: 0,
  },
];

// ---------------------------------------------------------------------------
// Query helpers (the "repository" seam)
// ---------------------------------------------------------------------------

export function getLocations(): PlantingLocation[] {
  return locations;
}

export function getLocation(id: string): PlantingLocation | undefined {
  return locations.find((l) => l.id === id);
}

export function getUserForest(userId: string = DEMO_USER_ID): TreeRecord[] {
  return demoTrees.filter((t) => t.userId === userId);
}

export function getTree(treeId: string): TreeRecord | undefined {
  return demoTrees.find((t) => t.treeId === treeId);
}

export function getUserStats(userId: string = DEMO_USER_ID): UserStats {
  const trees = getUserForest(userId);
  const totalCarbonKg = trees.reduce((sum, t) => sum + t.carbonKg, 0);
  const alive = trees.filter(
    (t) => t.status === "growing" || t.status === "planted",
  ).length;
  const accountedFor = trees.filter((t) => t.status !== "ordered").length;

  return {
    userId,
    displayName: "Varstar",
    totalTrees: trees.length,
    totalCarbonKg: Math.round(totalCarbonKg * 10) / 10,
    // ~9 m² canopy footprint per maturing tree (illustrative).
    forestAreaM2: trees.length * 9,
    survivalRate: accountedFor === 0 ? 1 : alive / accountedFor,
    streakDays: 23,
    badges: demoBadges,
  };
}

export { DEMO_USER_ID };
