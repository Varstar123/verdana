import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { DAILY_CHALLENGES } from "@/lib/community";
import { ChallengesBoard } from "@/components/app/ChallengesBoard";
import { ChallengesSkeleton } from "@/components/app/Skeletons";

export const metadata: Metadata = { title: "Challenges" };

async function ChallengesContent() {
  const session = await getSession();
  const persisted = isFirebaseAdminConfigured;

  return (
    <ChallengesBoard
      challenges={DAILY_CHALLENGES}
      persisted={persisted}
      streak={session.profile.stats.streakDays}
    />
  );
}

export default function ChallengesPage() {
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

      <Suspense fallback={<ChallengesSkeleton />}>
        <ChallengesContent />
      </Suspense>
    </div>
  );
}
