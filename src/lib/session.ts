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
 * - Demo mode (no Clerk keys): always the seeded demo profile, with admin access
 *   so the admin module is explorable.
 * - Clerk configured: identity comes from Clerk (Google sign-in). Profile data
 *   still comes from the demo layer for now — the Supabase DB connection is left
 *   as scaffolded and can back these reads later.
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
    const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

    const profile: Profile = {
      ...DEMO_PROFILE,
      displayName: fullName || user?.username || DEMO_PROFILE.displayName,
      username: user?.username || DEMO_PROFILE.username,
    };

    return { authenticated: true, demo: false, isAdmin, profile };
  } catch {
    // Degrade to demo rather than crash.
    return { authenticated: false, demo: true, isAdmin: true, profile: DEMO_PROFILE };
  }
}
