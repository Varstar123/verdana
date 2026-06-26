import { NextResponse } from "next/server";
import { getLocation, getTree } from "@/lib/data";

/**
 * GET /api/tree/{treeId}/certificate
 * Epic 2 — return certificate metadata for a tree.
 *
 * Stub: returns the data a PDF/QR certificate would be generated from. A real
 * implementation would render and store a signed PDF and return its URL.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ treeId: string }> },
) {
  const { treeId } = await params;
  const tree = getTree(treeId);

  if (!tree) {
    return NextResponse.json({ error: "Unknown treeId" }, { status: 404 });
  }

  const location = getLocation(tree.locationId);

  return NextResponse.json({
    treeId: tree.treeId,
    species: tree.species,
    project: location?.name ?? "Assigned site",
    country: location?.country ?? null,
    coordinates: { lat: tree.lat, lon: tree.lon },
    plantedAt: tree.plantedAt,
    status: tree.status,
    carbonKg: tree.carbonKg,
    verifyUrl: `https://verdana.example/verify/${tree.treeId}`,
    // Placeholder — real impl renders a signed PDF and returns its storage URL.
    pdfUrl: null,
  });
}
