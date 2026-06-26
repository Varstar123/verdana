import "server-only";
import type { ActivityItem } from "@/lib/types";
import { ACTIVITY_FEED } from "@/lib/community";
import { getFeed } from "@/lib/feed";
import { isFirebaseAdminConfigured } from "@/lib/env";

/**
 * Social graph (follows) + activity feed. Follows persist to Firestore via the
 * Admin SDK when configured; otherwise the client tracks them in localStorage.
 */

function followDocId(followerId: string, targetPlanetId: string) {
  return `${followerId}_${targetPlanetId}`;
}

export async function followInDb(followerId: string, targetPlanetId: string) {
  if (!isFirebaseAdminConfigured) return;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (db) {
      await db
        .collection("follows")
        .doc(followDocId(followerId, targetPlanetId))
        .set({ followerId, targetPlanetId, ts: Date.now() });
    }
  } catch {
    /* no-op */
  }
}

export async function unfollowInDb(followerId: string, targetPlanetId: string) {
  if (!isFirebaseAdminConfigured) return;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (db) {
      await db.collection("follows").doc(followDocId(followerId, targetPlanetId)).delete();
    }
  } catch {
    /* no-op */
  }
}

export async function isFollowingInDb(
  followerId: string,
  targetPlanetId: string,
): Promise<boolean> {
  if (!isFirebaseAdminConfigured) return false;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (db) {
      const snap = await db
        .collection("follows")
        .doc(followDocId(followerId, targetPlanetId))
        .get();
      return snap.exists;
    }
  } catch {
    /* no-op */
  }
  return false;
}

/** Combined activity: recent community posts + seeded lifestyle events. */
export async function getActivity(): Promise<ActivityItem[]> {
  const posts = await getFeed();
  const fromPosts: ActivityItem[] = posts.slice(0, 5).map((p) => ({
    id: `act-${p.id}`,
    actorPlanetId: p.authorPlanetId,
    actorName: p.authorName,
    actorHue: p.authorHue,
    verb: "posted",
    detail: `shared: "${p.body.slice(0, 60)}${p.body.length > 60 ? "…" : ""}"`,
    createdAt: p.createdAt,
  }));
  // Interleave a couple of post events with the seeded activity.
  return [fromPosts[0], ...ACTIVITY_FEED.slice(0, 4), ...fromPosts.slice(1, 3)]
    .filter(Boolean)
    .slice(0, 7);
}
