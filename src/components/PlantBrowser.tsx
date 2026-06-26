"use client";

import { useMemo, useState } from "react";
import type { PlantingLocation } from "@/lib/types";
import { LocationCard } from "@/components/LocationCard";

export function PlantBrowser({
  locations,
}: {
  locations: PlantingLocation[];
}) {
  const biomes = useMemo(
    () => ["All", ...Array.from(new Set(locations.map((l) => l.biome)))],
    [locations],
  );
  const [biome, setBiome] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = locations.filter((l) => {
    const matchesBiome = biome === "All" || l.biome === biome;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      l.name.toLowerCase().includes(q) ||
      l.country.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q);
    return matchesBiome && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {biomes.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBiome(b)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                biome === b
                  ? "bg-forest-600 text-white"
                  : "bg-white text-forest-700 ring-1 ring-inset ring-forest-100 hover:bg-forest-50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country or region…"
          className="w-full rounded-full border border-forest-100 bg-white px-5 py-2.5 text-sm outline-none transition focus:border-forest-300 focus:ring-2 focus:ring-forest-100 md:w-72"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-forest-900/50">
          No projects match your search yet. Try a different filter.
        </p>
      )}
    </div>
  );
}
