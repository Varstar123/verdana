"use server";

import { getCurrentUserId } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { followInDb, unfollowInDb, isFollowingInDb } from "@/lib/social";

const PLANET_ID = /^VER-[A-Z0-9]{6}$/;

export async function followAction(targetPlanetId: string): Promise<void> {
  const uid = await getCurrentUserId();
  if (!uid) return;
  if (!PLANET_ID.test(targetPlanetId)) return; // reject malformed targets
  const { profile } = await getSession();
  if (profile.planetId === targetPlanetId) return; // no self-follow
  await followInDb(uid, targetPlanetId);
}

export async function unfollowAction(targetPlanetId: string): Promise<void> {
  const uid = await getCurrentUserId();
  if (!uid) return;
  if (!PLANET_ID.test(targetPlanetId)) return;
  await unfollowInDb(uid, targetPlanetId);
}

/** Server-rendered initial follow state for a profile (false in demo). */
export async function getFollowState(targetPlanetId: string): Promise<boolean> {
  const uid = await getCurrentUserId();
  if (!uid) return false;
  return isFollowingInDb(uid, targetPlanetId);
}
