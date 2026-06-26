import Link from "next/link";
import { LeafIcon } from "@/components/icons";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5"
      aria-label="Verdana home"
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
          light
            ? "bg-white/15 text-white group-hover:bg-white/25"
            : "bg-forest-600 text-white group-hover:bg-forest-700"
        }`}
      >
        <LeafIcon className="h-5 w-5" />
      </span>
      <span
        className={`font-serif text-xl tracking-tight ${
          light ? "text-white" : "text-forest-800"
        }`}
      >
        Verdana
      </span>
    </Link>
  );
}
