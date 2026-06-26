import type { TreeStatus } from "@/lib/types";

const config: Record<TreeStatus, { label: string; className: string }> = {
  ordered: {
    label: "Ordered",
    className: "bg-sky/20 text-sky-900 ring-sky/40",
  },
  planted: {
    label: "Planted",
    className: "bg-forest-100 text-forest-800 ring-forest-200",
  },
  growing: {
    label: "Growing",
    className: "bg-forest-600/10 text-forest-700 ring-forest-300",
  },
  at_risk: {
    label: "At risk",
    className: "bg-amber-100 text-amber-800 ring-amber-300",
  },
  lost: {
    label: "Lost — replanting",
    className: "bg-bark/10 text-bark-dark ring-bark-light/40",
  },
};

export function StatusPill({ status }: { status: TreeStatus }) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
