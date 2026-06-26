import "server-only";
import { isFirebaseAdminConfigured } from "@/lib/env";

/**
 * Daily-challenge completion. Persists to Firestore (a completion doc + an
 * eco-points increment on the profile) when configured; otherwise the client
 * tracks completion + XP in localStorage (reset daily).
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
    if (db) {
      await db
        .collection("challengeCompletions")
        .doc(`${userId}_${challengeId}`)
        .set({ userId, challengeId, ts: Date.now() }, { merge: true });
      await db
        .collection("profiles")
        .doc(userId)
        .set(
          { ecoPoints: FieldValue.increment(xp), challengesCompleted: FieldValue.increment(1) },
          { merge: true },
        );
    }
  } catch {
    /* no-op in demo */
  }
}
