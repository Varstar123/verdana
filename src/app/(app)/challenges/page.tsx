import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { DAILY_CHALLENGES } from "@/lib/community";
import { ChallengesBoard } from "@/components/app/ChallengesBoard";

export const metadata: Metadata = { title: "Challenges" };

export default async function ChallengesPage() {
  const session = await getSession();
  const persisted = isFirebaseAdminConfigured && session.authenticated;

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

      <ChallengesBoard
        challenges={DAILY_CHALLENGES}
        persisted={persisted}
        streak={session.profile.stats.streakDays}
      />
    </div>
  );
}
