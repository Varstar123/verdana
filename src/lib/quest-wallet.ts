import "server-only";
import { isFirebaseAdminConfigured } from "@/lib/env";
import {
  DAILY_TASKS,
  QUESTS,
  emptyWallet,
  questDayKey,
  type QuestWallet,
} from "@/lib/quests";

/**
 * Per-user quest wallet, persisted in Firestore (`questWallets/{userId}`) so
 * coins and quest progress survive logins and sync across devices. Writes go
 * through the Admin SDK (server-only), which bypasses the client security rules.
 *
 * The wallet is sanitised on the way in and out: values are clamped, only known
 * task/quest ids are kept, and daily completions older than today are dropped
 * (that's the daily reset). In demo mode (no Firebase) these are no-ops and the
 * client falls back to localStorage.
 */

const COLLECTION = "questWallets";
const MAX_VALUE = 100_000_000;

const clampInt = (n: unknown) => Math.min(MAX_VALUE, Math.max(0, Math.floor(Number(n) || 0)));

/** Coerce arbitrary stored / client-sent data into a valid, bounded wallet. */
export function sanitizeWallet(raw: unknown): QuestWallet {
  const w = (raw ?? {}) as Partial<QuestWallet>;
  const day = questDayKey();

  const taskIds = new Set(DAILY_TASKS.map((t) => t.id));
  const todaysRaw = Array.isArray(w.dailyDone?.[day]) ? (w.dailyDone![day] as string[]) : [];
  const doneToday = [...new Set(todaysRaw.filter((id) => taskIds.has(id)))];

  const questSteps: Record<string, string[]> = {};
  for (const q of QUESTS) {
    const stepIds = new Set(q.steps.map((s) => s.id));
    const done = w.questSteps?.[q.id];
    if (Array.isArray(done)) {
      const kept = [...new Set(done.filter((id) => stepIds.has(id)))];
      if (kept.length) questSteps[q.id] = kept;
    }
  }

  const questIds = new Set(QUESTS.map((q) => q.id));
  const questsBonus = Array.isArray(w.questsBonus)
    ? [...new Set(w.questsBonus.filter((id) => questIds.has(id)))]
    : [];

  return {
    coins: clampInt(w.coins),
    xp: clampInt(w.xp),
    treesFunded: clampInt(w.treesFunded),
    // Only today's completions are retained → daily tasks reset each IST day.
    dailyDone: doneToday.length ? { [day]: doneToday } : {},
    questSteps,
    questsBonus,
  };
}

export async function readWallet(userId: string): Promise<QuestWallet> {
  if (!isFirebaseAdminConfigured) return emptyWallet();
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (!db) return emptyWallet();
    const snap = await db.collection(COLLECTION).doc(userId).get();
    return snap.exists ? sanitizeWallet(snap.data()) : emptyWallet();
  } catch {
    return emptyWallet();
  }
}

/** Persist a (sanitised) wallet. Returns the cleaned wallet actually stored. */
export async function saveWallet(userId: string, raw: unknown): Promise<QuestWallet> {
  const clean = sanitizeWallet(raw);
  if (!isFirebaseAdminConfigured) return clean;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (!db) return clean;
    await db.collection(COLLECTION).doc(userId).set({ ...clean, updatedAt: Date.now() });
  } catch {
    /* ignore write failure — the client keeps its optimistic state */
  }
  return clean;
}
