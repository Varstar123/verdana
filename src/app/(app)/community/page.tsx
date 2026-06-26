import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getFeed } from "@/lib/feed";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { CommunityFeed } from "@/components/app/CommunityFeed";

export const metadata: Metadata = { title: "Community" };

export default async function CommunityPage() {
  const [session, feed] = await Promise.all([getSession(), getFeed()]);
  const { profile, authenticated } = session;
  const persisted = isFirebaseAdminConfigured && authenticated;

  return (
    <div className="container-px py-8">
      <header className="mx-auto mb-6 max-w-2xl">
        <p className="eyebrow">Community</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          The feed
        </h1>
        <p className="mt-2 text-muted">
          Share your wins, swap ideas, and cheer each other on.
          {!persisted && (
            <span className="text-faint">
              {" "}
              (Demo: your posts are saved in this browser. Add Firebase keys to make
              them global.)
            </span>
          )}
        </p>
      </header>

      <CommunityFeed
        initial={feed}
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
