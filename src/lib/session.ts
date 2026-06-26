import "server-only";
import type { Profile } from "@/lib/types";
import { isClerkConfigured } from "@/lib/env";
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

/**
 * Returns the active session.
 *
 * - Demo mode (no Clerk): the seeded demo profile, with admin access so the admin
 *   module is explorable.
 * - Clerk signed in: identity from Clerk (Google). The profile is read from
 *   Firestore `profiles/{userId}` and CREATED fresh on first sign-in, so every
 *   real user gets their own Planet ID + stats. Falls back to the demo profile
 *   only if Firestore isn't configured.
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
    const fullName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      "Verdana Citizen";
    const username =
      user?.username ||
      user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      `citizen-${userId.slice(-5)}`;
    const isAdmin =
      (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

    let profile: Profile = {
      ...DEMO_PROFILE,
      displayName: fullName,
      username,
    };

    const { ensureProfile } = await import("@/lib/firebase/profiles");
    const real = await ensureProfile(userId, fullName, username);
    if (real) profile = real;

    return { authenticated: true, demo: false, isAdmin, profile };
  } catch {
    return { authenticated: false, demo: true, isAdmin: true, profile: DEMO_PROFILE };
  }
}
