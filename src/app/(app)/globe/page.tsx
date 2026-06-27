import { Suspense } from "react";
import type { Metadata } from "next";
import { GLOBAL_STATS } from "@/lib/community";
import { getActivity } from "@/lib/social";
import { EarthScene } from "@/components/earth/EarthScene";
import { LiveGlobeStats } from "@/components/app/LiveGlobeStats";
import { GlobeStatsSkeleton } from "@/components/app/Skeletons";

export const metadata: Metadata = { title: "Global Earth" };

// The shared planet's health rises as the whole community contributes.
const GLOBAL_HEALTH = 38;

async function GlobeStats() {
  const activity = await getActivity();
  return <LiveGlobeStats initial={GLOBAL_STATS} activity={activity} />;
}

export default function GlobePage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="aurora-bg opacity-50" />
      <div className="container-px py-8">
        <header className="mb-6">
          <p className="eyebrow">One planet, all of us</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
            The global Earth
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Every member&apos;s real-world action heals this shared planet. Watch
            it grow as the community contributes in real time.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="card-glass relative overflow-hidden">
            <div className="absolute left-5 top-5 z-10">
              <p className="eyebrow">Shared planet</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">
                {GLOBAL_HEALTH}% restored
              </p>
            </div>
            <div className="h-[56vh] min-h-[380px] w-full">
              <EarthScene health={GLOBAL_HEALTH} interactive />
            </div>
            <div className="absolute inset-x-5 bottom-5 z-10">
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${GLOBAL_HEALTH}%` }}
                />
              </div>
            </div>
          </div>

          <Suspense fallback={<GlobeStatsSkeleton />}>
            <GlobeStats />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
