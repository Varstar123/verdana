import { NextResponse } from "next/server";
import { getUserForest } from "@/lib/data";

/**
 * GET /api/user/{id}/forest
 * Epic 3 — return the user's trees (their digital forest).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const trees = getUserForest(id);
  return NextResponse.json({ userId: id, count: trees.length, trees });
}
