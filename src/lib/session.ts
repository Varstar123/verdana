import "server-only";
import { cache } from "react";
import type { Profile } from "@/lib/types";
import { isClerkConfigured, ADMIN_EMAILS } from "@/lib/env";
import { DEMO_PROFILE } from "@/lib/community";

export interface Session {
  /** true when a Clerk user is signed in */
  authenticated: boolean;
  /** true in demo mode (Clerk not configured) */
  demo: boolean;
  /** true for admins (Clerk publicMetadata.role === "admin"); local demo only otherwise */
  isAdmin: boolean;
  profile: Profile;
}

/**
 * Returns the active session.
 *
 * - Demo mode (no Clerk): the seeded demo profile. Admin is opened ONLY in local
 *   dev so the module is explorable — a production deploy missing Clerk config
 *   does NOT expose admin to the public (fail closed).
 * - Clerk signed in: identity from Clerk (Google). The profile is read from
 *   Firestore `profiles/{userId}` and CREATED fresh on first sign-in, so every
 *   real user gets their own Planet ID + stats. Falls back to the demo profile
 *   only if Firestore isn't configured.
 */
export const getSession = cache(async function getSession(): Promise<Session> {
  if (!isClerkConfigured) {
    // Open admin for local exploration, but never on a public production build.
    const demoAdmin = process.env.NODE_ENV !== "production";
    return { authenticated: false, demo: true, isAdmin: demoAdmin, profile: DEMO_PROFILE };
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
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
    const username =
      user?.username ||
      email.split("@")[0] ||
      `citizen-${userId.slice(-5)}`;
    const isAdmin =
      (user?.publicMetadata as { role?: string } | undefined)?.role === "admin" ||
      (email !== "" && ADMIN_EMAILS.includes(email));

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
    // Fail closed: an unexpected auth error must never grant admin or sign-in.
    // Treat the visitor as a signed-out, non-admin user.
    return { authenticated: false, demo: false, isAdmin: false, profile: DEMO_PROFILE };
  }
});

/**
 * Session for a write action. Throws "Unauthorized" unless the caller is a
 * signed-in user — or the local dev demo (Clerk not configured AND not a
 * production build). This means a production deploy that's missing Clerk config
 * fails closed for writes, never persisting as the shared demo identity.
 */
export async function requireWriter(): Promise<Session> {
  const session = await getSession();
  const demoOk = session.demo && process.env.NODE_ENV !== "production";
  if (!session.authenticated && !demoOk) {
    throw new Error("Unauthorized");
  }
  return session;
}
