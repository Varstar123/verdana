import type { Metadata } from "next";
import { getLocations } from "@/lib/data";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Plant real, verified trees and start your forest.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;
  const locations = getLocations();

  return (
    <div className="container-px py-14">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Plant a tree</p>
        <h1 className="mt-3 text-4xl text-forest-900 sm:text-5xl">
          Grow your forest
        </h1>
        <p className="mt-4 text-forest-900/60">
          Choose your site, pick how many trees, and we&apos;ll take it from
          here — with proof every step of the way.
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-5xl">
        <CheckoutForm locations={locations} initialLocationId={location} />
      </div>
    </div>
  );
}
