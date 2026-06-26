import type { Metadata } from "next";
import { getLocations } from "@/lib/data";
import { PlantBrowser } from "@/components/PlantBrowser";

export const metadata: Metadata = {
  title: "Plant a tree",
  description:
    "Browse real reforestation projects worldwide and choose exactly where your forest grows.",
};

export default function PlantPage() {
  const locations = getLocations();

  return (
    <div className="container-px py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Restoration projects</p>
        <h1 className="mt-3 text-4xl text-forest-900 sm:text-5xl">
          Choose where your forest grows
        </h1>
        <p className="mt-4 text-forest-900/60">
          Every project is run with vetted local partners and monitored by
          satellite. Pick a biome, a country, or a cause that speaks to you.
        </p>
      </header>

      <div className="mt-10">
        <PlantBrowser locations={locations} />
      </div>
    </div>
  );
}
