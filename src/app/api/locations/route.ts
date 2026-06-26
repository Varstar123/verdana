import { NextResponse } from "next/server";
import { getLocations } from "@/lib/data";

/**
 * GET /api/locations?country=Brazil&biome=Mangrove
 * Epic 1 — browse planting locations.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.toLowerCase();
  const biome = searchParams.get("biome")?.toLowerCase();

  let locations = getLocations();
  if (country) {
    locations = locations.filter((l) => l.country.toLowerCase() === country);
  }
  if (biome) {
    locations = locations.filter((l) => l.biome.toLowerCase().includes(biome));
  }

  return NextResponse.json({ count: locations.length, locations });
}
