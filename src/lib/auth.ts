import "server-only";
import { isClerkConfigured } from "@/lib/env";

/**
 * The authenticated Clerk user id, or null when signed out / in demo mode.
 * The single trust boundary for "who is acting" — never take the actor from
 * client-supplied input. Returns null (fail closed) on any auth error.
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!isClerkConfigured) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

/**
 * The actor id for persisted per-user state (likes, votes, challenge completions).
 * The signed-in Clerk user when available; otherwise a single stable demo id —
 * but ONLY in local dev, never in production. Keep this in lockstep with the
 * write gate in requireWriter() so all mutation paths agree on who is acting.
 */
export async function getWriterId(): Promise<string | null> {
  const uid = await getCurrentUserId();
  if (uid) return uid;
  if (!isClerkConfigured && process.env.NODE_ENV !== "production") return "demo-user";
  return null;
}
