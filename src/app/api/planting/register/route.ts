import { NextResponse } from "next/server";
import { getTree } from "@/lib/data";

/**
 * POST /api/planting/register
 * Body: { treeId: string, lat: number, lon: number, photoUrl?: string, deviceId?: string }
 * Epic 2 — field staff register a planting with GPS + photo.
 *
 * Stub: validates the payload and echoes a confirmed planting record.
 */
export async function POST(request: Request) {
  let body: {
    treeId?: string;
    lat?: number;
    lon?: number;
    photoUrl?: string;
    deviceId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { treeId, lat, lon, photoUrl, deviceId } = body;

  if (!treeId || typeof lat !== "number" || typeof lon !== "number") {
    return NextResponse.json(
      { error: "treeId, lat and lon are required" },
      { status: 400 },
    );
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: "lat/lon out of range" },
      { status: 400 },
    );
  }

  const tree = getTree(treeId);
  if (!tree) {
    return NextResponse.json({ error: "Unknown treeId" }, { status: 404 });
  }

  // In a real system this would write to PostGIS, store the photo hash on an
  // immutable ledger, and enqueue satellite-monitoring for the plot.
  return NextResponse.json(
    {
      treeId,
      status: "planted",
      lat,
      lon,
      photoUrl: photoUrl ?? null,
      deviceId: deviceId ?? null,
      registeredAt: new Date().toISOString(),
      ledgerRef: `0x${treeId.replace(/\D/g, "")}${lat.toFixed(0)}`,
    },
    { status: 201 },
  );
}
