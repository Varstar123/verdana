import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { getWriterId } from "@/lib/auth";
import { getFeed } from "@/lib/feed";
import { isFirebaseAdminConfigured, isFirebaseConfigured } from "@/lib/env";
import { TOP_PROFILES } from "@/lib/community";
import { computeEcoScore, getLevel } from "@/lib/scoring";
import { CommunityFeed } from "@/components/app/CommunityFeed";
import { WhoToFollow } from "@/components/app/WhoToFollow";
import { CommunitySkeleton } from "@/components/app/Skeletons";

export const metadata: Metadata = { title: "Community" };

async function CommunityContent() {
  const [session, uid] = await Promise.all([getSession(), getWriterId()]);
  const feed = await getFeed(uid);
  const { profile } = session;
  const persisted = isFirebaseAdminConfigured;

  const suggestions = TOP_PROFILES.filter(
    (p) => p.planetId !== profile.planetId,
  )
    .slice(0, 6)
    .map((p) => ({
      planetId: p.planetId,
      name: p.displayName,
      hue: p.avatarHue,
      level: getLevel(computeEcoScore(p.stats)).name,
      country: p.country,
    }));

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <WhoToFollow suggestions={suggestions} persisted={persisted} />
      </div>

      <CommunityFeed
        initial={feed}
        me={{
          name: profile.displayName,
          hue: profile.avatarHue,
          planetId: profile.planetId,
        }}
        persisted={persisted}
        realtime={isFirebaseConfigured}
      />
    </>
  );
}

export default function CommunityPage() {
  const persisted = isFirebaseAdminConfigured;

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

      <Suspense fallback={<CommunitySkeleton />}>
        <CommunityContent />
      </Suspense>
    </div>
  );
}
