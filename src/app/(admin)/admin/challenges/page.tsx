import type { Metadata } from "next";
import { DAILY_CHALLENGES } from "@/lib/community";
import { ChallengeManager } from "@/components/admin/ChallengeManager";

export const metadata: Metadata = { title: "Admin · Challenges" };

export default function AdminChallengesPage() {
  return (
    <div className="container-px space-y-6 py-8">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Daily challenges
        </h1>
        <p className="mt-2 text-muted">
          Curate the challenges that drive daily engagement.
        </p>
      </header>
      <ChallengeManager initial={DAILY_CHALLENGES} />
    </div>
  );
}
