import { ChallengesSkeleton } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div className="container-px py-8">
      <header className="mb-6">
        <p className="eyebrow">Daily challenges</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Small actions, every day
        </h1>
        <p className="mt-2 text-muted">
          Complete today&apos;s challenges to earn XP, keep your streak alive, and
          grow your Earth.
        </p>
      </header>

      <ChallengesSkeleton />
    </div>
  );
}
