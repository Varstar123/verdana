import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getThreads, FORUM_CATEGORIES } from "@/lib/forums";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { ForumBoard } from "@/components/app/ForumBoard";

export const metadata: Metadata = { title: "Forums" };

export default async function ForumsPage() {
  const [session, threads] = await Promise.all([getSession(), getThreads()]);
  const { profile, authenticated } = session;
  const persisted = isFirebaseAdminConfigured && authenticated;

  return (
    <div className="container-px py-8">
      <header className="mb-6">
        <p className="eyebrow">Eco Forums</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Discuss, debate, share what works
        </h1>
        <p className="mt-2 text-muted">
          Ask questions, swap tactics, and upvote the best ideas across the
          community.
        </p>
      </header>

      <ForumBoard
        initial={threads}
        categories={FORUM_CATEGORIES}
        me={{
          name: profile.displayName,
          hue: profile.avatarHue,
          planetId: profile.planetId,
        }}
        persisted={persisted}
      />
    </div>
  );
}
