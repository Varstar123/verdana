"use client";

import Link from "next/link";
import { Avatar } from "@/components/app/Avatar";
import { FollowButton } from "@/components/app/FollowButton";

export interface Suggestion {
  planetId: string;
  name: string;
  hue: number;
  level: string;
  country: string;
}

export function WhoToFollow({
  suggestions,
  persisted,
}: {
  suggestions: Suggestion[];
  persisted: boolean;
}) {
  if (suggestions.length === 0) return null;
  return (
    <div className="card-glass mb-5 p-4">
      <p className="eyebrow mb-3">Who to follow</p>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {suggestions.map((s) => (
          <div
            key={s.planetId}
            className="flex w-48 shrink-0 flex-col items-center gap-2 rounded-2xl border border-hairline/10 bg-surface p-4 text-center"
          >
            <Link href={`/profile/${s.planetId}`}>
              <Avatar name={s.name} hue={s.hue} size={48} />
            </Link>
            <Link
              href={`/profile/${s.planetId}`}
              className="truncate text-sm font-semibold text-ink hover:underline"
            >
              {s.name}
            </Link>
            <p className="truncate text-xs text-faint">{s.level}</p>
            <FollowButton
              targetPlanetId={s.planetId}
              targetName={s.name}
              persisted={persisted}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
