import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import {
  LEVELS,
  LEVEL_REWARDS,
  getLevel,
  computeEcoScore,
  formatCompact,
} from "@/lib/scoring";
import { CheckIcon, LockIcon, StarIcon } from "@/components/icons";
import { RewardsSkeleton } from "@/components/app/Skeletons";

export const metadata: Metadata = { title: "Levels & Rewards" };

async function RewardsContent() {
  const { profile } = await getSession();
  const ecoScore = computeEcoScore(profile.stats);
  const level = getLevel(ecoScore);

  return (
    <>
      <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-surface px-4 py-2 ring-1 ring-inset ring-hairline/12">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white"
          style={{ background: level.accent }}
        >
          <StarIcon className="h-3.5 w-3.5" /> Lv {level.index + 1} · {level.name}
        </span>
        <span className="text-sm text-muted">
          {formatCompact(ecoScore)} eco-points
          {level.nextScore && (
            <span className="text-faint">
              {" "}
              · {formatCompact(level.nextScore - ecoScore)} to next
            </span>
          )}
        </span>
      </div>

      <ol className="space-y-3">
        {LEVELS.map((lv, i) => {
          const reward = LEVEL_REWARDS[i];
          const unlocked = i <= level.index;
          const current = i === level.index;
          return (
            <li
              key={lv.name}
              className={`card-glass flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${
                current ? "ring-2 ring-brand/40" : ""
              } ${unlocked ? "" : "opacity-75"}`}
            >
              <div className="flex items-center gap-4 sm:w-64 sm:shrink-0">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-semibold text-white"
                  style={{ background: unlocked ? lv.accent : "rgb(var(--ink) / 0.12)" }}
                >
                  {unlocked ? i + 1 : <LockIcon className="h-5 w-5" />}
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-ink">
                    {lv.name}
                  </p>
                  <p className="text-xs text-faint">
                    {lv.minScore === 0 ? "Start" : `${formatCompact(lv.minScore)} pts`}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap gap-2">
                {reward.perks.map((p) => (
                  <span
                    key={p}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      unlocked
                        ? "bg-brand/10 text-brand"
                        : "bg-ink/5 text-faint"
                    }`}
                  >
                    {p}
                  </span>
                ))}
              </div>

              <div className="sm:shrink-0">
                {current ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                    <StarIcon className="h-3.5 w-3.5" /> You are here
                  </span>
                ) : unlocked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22A155]/12 px-3 py-1 text-xs font-semibold text-[#22A155]">
                    <CheckIcon className="h-3.5 w-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-faint">
                    <LockIcon className="h-3.5 w-3.5" /> Reach {formatCompact(lv.minScore)} pts
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export default function RewardsPage() {
  return (
    <div className="container-px py-8">
      <header className="mb-6">
        <p className="eyebrow">Levels &amp; rewards</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Grow your impact, unlock the planet
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Every eco-point moves you up the ranks. Each level unlocks new themes,
          profile decorations, and upgrades to your living Earth.
        </p>
      </header>

      <Suspense fallback={<RewardsSkeleton />}>
        <RewardsContent />
      </Suspense>
    </div>
  );
}
