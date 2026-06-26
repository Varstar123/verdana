import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { isFirebaseAdminConfigured } from "@/lib/env";

let cached: Firestore | null = null;

/**
 * Server-side Firestore via the Admin SDK. Returns `null` in demo mode (no
 * service account). Used by server components / the session layer to read
 * profiles, leaderboards, etc.
 */
export function getAdminDb(): Firestore | null {
  if (!isFirebaseAdminConfigured) return null;
  if (cached) return cached;

  const app: App = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Vercel stores the key with literal "\n" — restore real newlines.
          privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
        }),
      });

  cached = getFirestore(app);
  return cached;
}
