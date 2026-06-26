import type { BadgeTier } from "@/lib/types";
import { getBadge } from "@/lib/scoring";
import { LockIcon } from "@/components/icons";

const TIER_RING: Record<BadgeTier, string> = {
  bronze: "ring-[#CD7F32]/50",
  silver: "ring-[#9aa3ad]/50",
  gold: "ring-[#E3B341]/60",
  elite: "ring-aurora-violet/60",
};

export function BadgeChip({
  id,
  earned = true,
}: {
  id: string;
  earned?: boolean;
}) {
  const badge = getBadge(id);
  if (!badge) return null;

  return (
    <div
      title={`${badge.name} — ${badge.description}`}
      className={`flex items-center gap-3 rounded-2xl border border-hairline/10 p-3 ring-1 ring-inset transition-transform hover:-translate-y-0.5 ${
        earned ? `bg-surface ${TIER_RING[badge.tier]}` : "bg-ink/5 ring-transparent"
      }`}
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl text-xl ${
          earned ? "bg-ink/5" : "bg-ink/5 opacity-40 grayscale"
        }`}
      >
        {earned ? badge.emoji : <LockIcon className="h-4 w-4 text-faint" />}
      </span>
      <div className="min-w-0">
        <p
          className={`truncate text-sm font-semibold ${
            earned ? "text-ink" : "text-faint"
          }`}
        >
          {badge.name}
        </p>
        <p className="truncate text-xs text-faint">{badge.description}</p>
      </div>
    </div>
  );
}
