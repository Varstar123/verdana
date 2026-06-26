import type { PlantingLocation, TreeRecord } from "@/lib/types";
import { StatusPill } from "@/components/StatusPill";
import { TreeIcon, MapPinIcon } from "@/components/icons";

export function TreeCard({
  tree,
  location,
}: {
  tree: TreeRecord;
  location?: PlantingLocation;
}) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-forest-50 text-forest-600">
            <TreeIcon className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-base text-forest-900">{tree.species}</h3>
            <p className="font-mono text-xs text-forest-900/50">
              #{tree.treeId}
            </p>
          </div>
        </div>
        <StatusPill status={tree.status} />
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-ivory p-2.5">
          <dt className="text-[11px] uppercase tracking-wide text-forest-900/50">
            Height
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-forest-800">
            {tree.heightCm > 0 ? `${tree.heightCm} cm` : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-ivory p-2.5">
          <dt className="text-[11px] uppercase tracking-wide text-forest-900/50">
            CO₂
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-forest-800">
            {tree.carbonKg > 0 ? `${tree.carbonKg} kg` : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-ivory p-2.5">
          <dt className="text-[11px] uppercase tracking-wide text-forest-900/50">
            Planted
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-forest-800">
            {tree.plantedAt
              ? new Date(tree.plantedAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "Pending"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-forest-900/60">
        <MapPinIcon className="h-3.5 w-3.5 text-forest-500" />
        <span>
          {location ? `${location.name}, ${location.country}` : "Assigned site"}
        </span>
        <span className="ml-auto font-mono text-forest-900/40">
          {tree.lat.toFixed(3)}, {tree.lon.toFixed(3)}
        </span>
      </div>
    </article>
  );
}
