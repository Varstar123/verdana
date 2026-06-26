"use server";

import { isClerkConfigured } from "@/lib/env";
import { followInDb, unfollowInDb, isFollowingInDb } from "@/lib/social";

async function currentUserId(): Promise<string | null> {
  if (!isClerkConfigured) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

export async function followAction(targetPlanetId: string): Promise<void> {
  const uid = await currentUserId();
  if (uid) await followInDb(uid, targetPlanetId);
}

export async function unfollowAction(targetPlanetId: string): Promise<void> {
  const uid = await currentUserId();
  if (uid) await unfollowInDb(uid, targetPlanetId);
}

/** Server-rendered initial follow state for a profile (false in demo). */
export async function getFollowState(targetPlanetId: string): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  return isFollowingInDb(uid, targetPlanetId);
}
