import "server-only";
import type { Profile, ProfileStats } from "@/lib/types";
import { evaluateBadges } from "@/lib/scoring";
import { isFirebaseAdminConfigured } from "@/lib/env";

/**
 * Firestore profile helpers — read-or-create a per-user profile (keyed by Clerk
 * userId), and resolve a public profile by Planet ID. Used once Clerk auth is on
 * so every real user gets their own data instead of the shared demo profile.
 */

const ZERO_STATS: ProfileStats = {
  treesPlanted: 0,
  co2OffsetKg: 0,
  plasticRemovedKg: 0,
  donationsUsd: 0,
  volunteerHours: 0,
  recycleKg: 0,
  challengesCompleted: 0,
  lessonsCompleted: 0,
  ecoPoints: 0,
  streakDays: 0,
};

function genPlanetId(): string {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "VER-";
  for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

function docToProfile(id: string, d: Record<string, unknown>): Profile {
  const num = (k: string) => Number(d[k] ?? 0);
  const stats: ProfileStats = {
    treesPlanted: num("treesPlanted"),
    co2OffsetKg: num("co2OffsetKg"),
    plasticRemovedKg: num("plasticRemovedKg"),
    donationsUsd: num("donationsUsd"),
    volunteerHours: num("volunteerHours"),
    recycleKg: num("recycleKg"),
    challengesCompleted: num("challengesCompleted"),
    lessonsCompleted: num("lessonsCompleted"),
    ecoPoints: num("ecoPoints"),
    streakDays: num("streakDays"),
  };
  const created = Number(d.createdAt ?? 0);
  return {
    id,
    planetId: String(d.planetId ?? "VER-000000"),
    username: String(d.username ?? "citizen"),
    displayName: String(d.displayName ?? d.username ?? "Verdana Citizen"),
    avatarHue: num("avatarHue"),
    bio: String(d.bio ?? ""),
    location: (d.location as string) ?? null,
    country: String(d.country ?? "Earth"),
    org: (d.org as string) ?? null,
    joinedAt: created ? new Date(created).toISOString().slice(0, 10) : "",
    stats,
    followers: num("followers"),
    following: num("following"),
    badgeIds: evaluateBadges(stats),
  };
}

/** Read the user's profile, creating a fresh one on first sign-in. */
export async function ensureProfile(
  userId: string,
  fullName: string,
  username: string,
): Promise<Profile | null> {
  if (!isFirebaseAdminConfigured) return null;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (!db) return null;

    const ref = db.collection("profiles").doc(userId);
    const snap = await ref.get();
    if (snap.exists) return docToProfile(userId, snap.data() ?? {});

    const doc = {
      planetId: genPlanetId(),
      username,
      displayName: fullName,
      avatarHue: hueFrom(userId),
      bio: "",
      country: "Earth",
      ...ZERO_STATS,
      ecoScore: 0,
      earthHealth: 0,
      followers: 0,
      following: 0,
      createdAt: Date.now(),
    };
    await ref.set(doc);
    return docToProfile(userId, doc);
  } catch {
    return null;
  }
}

/** Resolve any public profile by its Planet ID (for /profile/[planetId]). */
export async function getProfileByPlanetIdFromDb(
  planetId: string,
): Promise<Profile | null> {
  if (!isFirebaseAdminConfigured) return null;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (!db) return null;
    const q = await db
      .collection("profiles")
      .where("planetId", "==", planetId.trim().toUpperCase())
      .limit(1)
      .get();
    if (q.empty) return null;
    const d = q.docs[0];
    return docToProfile(d.id, d.data());
  } catch {
    return null;
  }
}
