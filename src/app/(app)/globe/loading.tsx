import { CardSkeleton, GlobeStatsSkeleton } from "@/components/app/Skeletons";

export default function Loading() {
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
          <CardSkeleton className="h-[56vh] min-h-[380px]" />
          <GlobeStatsSkeleton />
        </div>
      </div>
    </div>
  );
}
