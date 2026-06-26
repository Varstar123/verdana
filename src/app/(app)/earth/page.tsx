import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import {
  computeEcoScore,
  computeEarthHealth,
  getEarthStage,
  EARTH_STAGES,
} from "@/lib/scoring";
import { EarthScene } from "@/components/earth/EarthScene";
import { CheckIcon, LockIcon, GlobeIcon } from "@/components/icons";

export const metadata: Metadata = { title: "My Earth" };

export default async function EarthPage() {
  const { profile } = await getSession();
  const ecoScore = computeEcoScore(profile.stats);
  const health = computeEarthHealth(ecoScore);
  const { index: currentIndex } = getEarthStage(health);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="aurora-bg opacity-60" />

      <div className="container-px grid gap-6 py-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Earth canvas */}
        <div className="card-glass relative overflow-hidden">
          <div className="absolute left-5 top-5 z-10">
            <p className="eyebrow">{profile.planetId}</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
              {profile.displayName}&apos;s Earth
            </h1>
          </div>
          <div className="absolute right-5 top-5 z-10 rounded-full bg-ink/5 px-3 py-1.5 text-xs text-muted backdrop-blur">
            drag to rotate · scroll to zoom
          </div>

          <div className="h-[58vh] min-h-[420px] w-full">
            <EarthScene health={health} interactive />
          </div>

          <div className="absolute inset-x-5 bottom-5 z-10 flex items-center gap-4 rounded-2xl bg-canvas/70 p-4 backdrop-blur">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white">
              <GlobeIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">
                  {EARTH_STAGES[currentIndex].title}
                </span>
                <span className="text-muted">{health}% restored</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-[width] duration-700"
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stage ladder */}
        <div className="card-glass p-6">
          <p className="eyebrow">Growth stages</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Unlock your dream Earth
          </h2>
          <p className="mt-2 text-sm text-muted">
            Every real-world action raises your Earth&apos;s health. Reach 100% to
            unlock the radiant Dream Earth.
          </p>

          <ol className="mt-5 space-y-2">
            {EARTH_STAGES.map((st, i) => {
              const unlocked = health >= st.threshold;
              const current = i === currentIndex;
              return (
                <li
                  key={st.key}
                  className={`flex items-start gap-3 rounded-2xl border p-3 transition-colors ${
                    current
                      ? "border-brand/40 bg-brand/8"
                      : "border-hairline/10 bg-surface"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                      unlocked ? "bg-brand text-white" : "bg-ink/5 text-faint"
                    }`}
                  >
                    {unlocked ? <CheckIcon className="h-4 w-4" /> : <LockIcon className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold ${current ? "text-brand" : "text-ink"}`}>
                        {st.title}
                      </p>
                      <span className="shrink-0 text-xs text-faint">
                        {st.threshold}%
                      </span>
                    </div>
                    <p className="text-xs text-faint">{st.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
