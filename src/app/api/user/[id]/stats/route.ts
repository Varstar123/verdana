import { NextResponse } from "next/server";
import { getUserStats } from "@/lib/data";

/**
 * GET /api/user/{id}/stats
 * Epic 3 — aggregated impact stats for the carbon dashboard.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stats = getUserStats(id);
  return NextResponse.json(stats);
}
