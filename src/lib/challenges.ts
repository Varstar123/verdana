import "server-only";
import { isFirebaseAdminConfigured } from "@/lib/env";

/**
 * Daily-challenge completion. Persists to Firestore (a per-day completion doc +
 * an eco-points increment on the profile) when configured; otherwise the client
 * tracks completion + XP in localStorage (reset daily).
 *
 * Idempotent per (user, challenge, UTC day): the XP/coins are awarded in a
 * transaction that no-ops if the completion already exists, so a client cannot
 * farm points by replaying the action. `xp` is supplied by the trusted server
 * caller (derived from the challenge definition), never by the browser.
 */
export async function completeChallengeInDb(
  userId: string,
  challengeId: string,
  xp: number,
): Promise<void> {
  if (!isFirebaseAdminConfigured) return;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const db = getAdminDb();
    if (!db) return;
    const dateKey = new Date().toISOString().slice(0, 10); // UTC day
    const completionRef = db
      .collection("challengeCompletions")
      .doc(`${userId}_${challengeId}_${dateKey}`);
    const profileRef = db.collection("profiles").doc(userId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(completionRef);
      if (snap.exists) return; // already claimed today — no double reward
      tx.set(completionRef, { userId, challengeId, dateKey, xp, ts: Date.now() });
      tx.set(
        profileRef,
        { ecoPoints: FieldValue.increment(xp), challengesCompleted: FieldValue.increment(1) },
        { merge: true },
      );
    });
  } catch {
    /* no-op in demo */
  }
}
