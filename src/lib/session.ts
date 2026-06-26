import "server-only";
import type { Profile, ProfileStats } from "@/lib/types";
import { isClerkConfigured, isFirebaseAdminConfigured } from "@/lib/env";
import { DEMO_PROFILE } from "@/lib/community";

export interface Session {
  /** true when a Clerk user is signed in */
  authenticated: boolean;
  /** true in demo mode (Clerk not configured) */
  demo: boolean;
  /** true for admins (Clerk publicMetadata.role === "admin"); always true in demo */
  isAdmin: boolean;
  profile: Profile;
}

/** Merge a Firestore profile doc over a base profile (defensive). */
function mergeProfileDoc(base: Profile, data: Record<string, unknown>): Profile {
  const num = (k: string, d: number) =>
    typeof data[k] === "number" ? (data[k] as number) : d;
  const stats: ProfileStats = {
    treesPlanted: num("treesPlanted", base.stats.treesPlanted),
    co2OffsetKg: num("co2OffsetKg", base.stats.co2OffsetKg),
    plasticRemovedKg: num("plasticRemovedKg", base.stats.plasticRemovedKg),
    donationsUsd: num("donationsUsd", base.stats.donationsUsd),
    volunteerHours: num("volunteerHours", base.stats.volunteerHours),
    recycleKg: num("recycleKg", base.stats.recycleKg),
    challengesCompleted: num("challengesCompleted", base.stats.challengesCompleted),
    lessonsCompleted: num("lessonsCompleted", base.stats.lessonsCompleted),
    ecoPoints: num("ecoPoints", base.stats.ecoPoints),
    streakDays: num("streakDays", base.stats.streakDays),
  };
  return {
    ...base,
    displayName: (data.displayName as string) || base.displayName,
    username: (data.username as string) || base.username,
    planetId: (data.planetId as string) || base.planetId,
    bio: (data.bio as string) ?? base.bio,
    country: (data.country as string) || base.country,
    stats,
  };
}

/**
 * Returns the active session.
 *
 * - Demo mode (no Clerk keys): the seeded demo profile, with admin access so the
 *   admin module is explorable.
 * - Clerk configured: identity from Clerk (Google sign-in). If Firebase (admin)
 *   is configured, the profile is read from Firestore `profiles/{userId}`;
 *   otherwise it falls back to the demo profile data.
 */
export async function getSession(): Promise<Session> {
  if (!isClerkConfigured) {
    return { authenticated: false, demo: true, isAdmin: true, profile: DEMO_PROFILE };
  }

  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      return { authenticated: false, demo: false, isAdmin: false, profile: DEMO_PROFILE };
    }

    const user = await currentUser();
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    const isAdmin =
      (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

    let profile: Profile = {
      ...DEMO_PROFILE,
      displayName: fullName || user?.username || DEMO_PROFILE.displayName,
      username: user?.username || DEMO_PROFILE.username,
    };

    // Read the user's profile from Firestore when the DB is wired up.
    if (isFirebaseAdminConfigured) {
      try {
        const { getAdminDb } = await import("@/lib/firebase/admin");
        const db = getAdminDb();
        if (db) {
          const snap = await db.collection("profiles").doc(userId).get();
          if (snap.exists) profile = mergeProfileDoc(profile, snap.data() ?? {});
        }
      } catch {
        // Firestore hiccup — keep the Clerk-derived profile.
      }
    }

    return { authenticated: true, demo: false, isAdmin, profile };
  } catch {
    return { authenticated: false, demo: true, isAdmin: true, profile: DEMO_PROFILE };
  }
}
