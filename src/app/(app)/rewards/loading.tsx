import { RewardsSkeleton } from "@/components/app/Skeletons";

export default function Loading() {
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

      <RewardsSkeleton />
    </div>
  );
}
