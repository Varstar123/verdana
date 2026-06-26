import Link from "next/link";
import type { PlantingLocation } from "@/lib/types";
import { MapPinIcon, ArrowRightIcon } from "@/components/icons";

export function LocationCard({ location }: { location: PlantingLocation }) {
  const progress = Math.min(
    100,
    Math.round((location.treesPlanted / location.treesNeeded) * 100),
  );

  return (
    <article className="card group overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div
        className={`relative h-40 bg-gradient-to-br ${location.artwork} leaf-grain`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,255,255,0.25),transparent_45%)]" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-forest-700 backdrop-blur">
          <MapPinIcon className="h-3.5 w-3.5" />
          {location.country}
        </span>
        <span className="absolute bottom-4 right-4 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          ${location.pricePerTree}/tree
        </span>
      </div>

      <div className="p-5">
        <p className="eyebrow">{location.biome}</p>
        <h3 className="mt-1 text-lg text-forest-900">{location.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest-900/60">
          {location.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {location.species.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs text-forest-700"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-forest-900/60">
            <span>{progress}% funded</span>
            <span>{location.treesPlanted.toLocaleString()} planted</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-forest-100">
            <div
              className="h-full rounded-full bg-forest-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Link
          href={{ pathname: "/checkout", query: { location: location.id } }}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 transition-colors hover:text-forest-800"
        >
          Plant here
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
