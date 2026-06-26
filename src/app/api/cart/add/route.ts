import { NextResponse } from "next/server";
import { getLocation } from "@/lib/data";

/**
 * POST /api/cart/add
 * Body: { locationId: string, quantity: number, gift?: boolean }
 * Epic 1 — add trees to cart / place order.
 *
 * Stub: validates input and returns a mock order. A real implementation would
 * persist the cart, charge via Stripe, and allocate TreeRecords.
 */
export async function POST(request: Request) {
  let body: { locationId?: string; quantity?: number; gift?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { locationId, quantity = 1, gift = false } = body;

  if (!locationId) {
    return NextResponse.json(
      { error: "locationId is required" },
      { status: 400 },
    );
  }

  const location = getLocation(locationId);
  if (!location) {
    return NextResponse.json({ error: "Unknown locationId" }, { status: 404 });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { error: "quantity must be a positive integer" },
      { status: 400 },
    );
  }

  const subtotal = location.pricePerTree * quantity;
  const orderId = `VD-${Date.now().toString(36).toUpperCase()}`;

  return NextResponse.json(
    {
      orderId,
      status: "reserved",
      gift,
      items: [{ locationId, location: location.name, quantity }],
      subtotalUsd: subtotal,
      estCarbonKg: Math.round(quantity * 21.5),
    },
    { status: 201 },
  );
}
