"use client";

import { useState } from "react";
import Link from "next/link";
import type { PlantingLocation } from "@/lib/types";
import {
  ArrowRightIcon,
  LeafIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@/components/icons";

type Status = "idle" | "submitting" | "done";

export function CheckoutForm({
  locations,
  initialLocationId,
}: {
  locations: PlantingLocation[];
  initialLocationId?: string;
}) {
  const [locationId, setLocationId] = useState(
    initialLocationId && locations.some((l) => l.id === initialLocationId)
      ? initialLocationId
      : locations[0].id,
  );
  const [quantity, setQuantity] = useState(3);
  const [gift, setGift] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const location = locations.find((l) => l.id === locationId)!;
  const subtotal = location.pricePerTree * quantity;
  const estCarbon = Math.round(quantity * 21.5); // ~21.5 kg CO2 / tree / lifetime (illustrative)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId, quantity, gift }),
      });
      const data = await res.json();
      setConfirmation(data.orderId ?? "VD-ORDER");
    } catch {
      // The scaffold has no real payment backend; still confirm optimistically.
      setConfirmation("VD-DEMO");
    } finally {
      setStatus("done");
    }
  }

  if (status === "done") {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest-50 text-forest-600">
          <LeafIcon className="h-8 w-8 animate-sprout" />
        </div>
        <h2 className="mt-6 text-2xl text-forest-900">Your forest is growing 🌱</h2>
        <p className="mt-2 text-forest-900/60">
          {quantity} {quantity === 1 ? "tree" : "trees"} reserved in{" "}
          <span className="font-semibold text-forest-700">{location.name}</span>.
          You&apos;ll get a GPS-tagged photo once each one is in the ground.
        </p>

        <dl className="mt-6 space-y-2 rounded-2xl bg-ivory p-5 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-forest-900/55">Confirmation</dt>
            <dd className="font-mono text-forest-800">{confirmation}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-forest-900/55">Project</dt>
            <dd className="text-forest-800">
              {location.name}, {location.country}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-forest-900/55">Est. lifetime CO₂</dt>
            <dd className="text-forest-800">{estCarbon} kg</dd>
          </div>
        </dl>

        <Link href="/forest" className="btn-primary mt-7 w-full">
          View my forest
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
    >
      {/* Left: choices */}
      <div className="space-y-8">
        <fieldset>
          <legend className="text-sm font-semibold text-forest-900">
            Planting location
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {locations.map((l) => (
              <label
                key={l.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  locationId === l.id
                    ? "border-forest-500 bg-forest-50/60 ring-2 ring-forest-200"
                    : "border-forest-100 bg-white hover:border-forest-200"
                }`}
              >
                <input
                  type="radio"
                  name="location"
                  value={l.id}
                  checked={locationId === l.id}
                  onChange={() => setLocationId(l.id)}
                  className="mt-1 accent-forest-600"
                />
                <span>
                  <span className="block font-semibold text-forest-900">
                    {l.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-forest-900/55">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {l.country} · ${l.pricePerTree}/tree
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-forest-900">
            How many trees?
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {[1, 3, 5, 10, 25].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setQuantity(n)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  quantity === n
                    ? "bg-forest-600 text-white"
                    : "bg-white text-forest-700 ring-1 ring-inset ring-forest-100 hover:bg-forest-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-3 text-sm text-forest-900/80">
          <input
            type="checkbox"
            checked={gift}
            onChange={(e) => setGift(e.target.checked)}
            className="h-4 w-4 accent-forest-600"
          />
          This is a gift — send a personalized Tree-Card
        </label>
      </div>

      {/* Right: order summary */}
      <aside className="card h-fit p-6">
        <h2 className="text-lg text-forest-900">Order summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-forest-900/60">
              {quantity} × {location.name}
            </dt>
            <dd className="font-medium text-forest-900">${subtotal}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-forest-900/60">Verification & monitoring</dt>
            <dd className="font-medium text-forest-700">Included</dd>
          </div>
          <div className="flex justify-between border-t border-forest-100 pt-3">
            <dt className="font-semibold text-forest-900">Total</dt>
            <dd className="font-serif text-xl text-forest-900">${subtotal}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-forest-50 p-3 text-xs text-forest-700">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
          Every tree is GPS-tagged, photographed at planting, and monitored by
          satellite. Est. {estCarbon} kg CO₂ over its lifetime.
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary mt-6 w-full disabled:opacity-70"
        >
          {status === "submitting" ? "Planting…" : "Plant my trees"}
          {status !== "submitting" && <ArrowRightIcon className="h-4 w-4" />}
        </button>
        <p className="mt-3 text-center text-xs text-forest-900/45">
          Demo checkout — no payment is processed.
        </p>
      </aside>
    </form>
  );
}
