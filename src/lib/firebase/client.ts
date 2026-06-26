"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { FIREBASE_CONFIG, isFirebaseConfigured } from "@/lib/env";

/**
 * Browser Firestore. Returns `null` when Firebase isn't configured, which the
 * UI treats as "demo mode". Use for client-side reads/writes (e.g. the social
 * feed) guarded by Firestore security rules.
 */
export function getDb(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  return getFirestore(app);
}
