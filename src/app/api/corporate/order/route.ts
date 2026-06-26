import { NextResponse } from "next/server";

/**
 * POST /api/corporate/order
 * Body: { companyId: string, treeQty: number, projectId?: string }
 * Epic 4 — corporate bulk order.
 *
 * Stub: validates and returns a mock corporate order with volume pricing.
 */
export async function POST(request: Request) {
  let body: { companyId?: string; treeQty?: number; projectId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { companyId, treeQty, projectId } = body;

  if (!companyId || !Number.isInteger(treeQty) || (treeQty ?? 0) < 1) {
    return NextResponse.json(
      { error: "companyId and a positive integer treeQty are required" },
      { status: 400 },
    );
  }

  const qty = treeQty as number;
  // Simple volume pricing tiers (illustrative).
  const unit = qty >= 10000 ? 9 : qty >= 1000 ? 11 : 14;
  const total = unit * qty;

  return NextResponse.json(
    {
      orderId: `VD-CORP-${Date.now().toString(36).toUpperCase()}`,
      companyId,
      projectId: projectId ?? null,
      treeQty: qty,
      unitPriceUsd: unit,
      totalUsd: total,
      estCarbonTonnes: Math.round((qty * 21.5) / 1000),
      status: "invoiced",
    },
    { status: 201 },
  );
}
