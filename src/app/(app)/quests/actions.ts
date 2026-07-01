"use server";

import { getWriterId } from "@/lib/auth";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { saveWallet } from "@/lib/quest-wallet";
import type { QuestWallet } from "@/lib/quests";

/**
 * Persist the signed-in user's quest wallet (server-validated). No-op when the
 * caller isn't signed in or Firebase isn't configured — in that case the client
 * keeps its localStorage copy, which is the demo-mode behaviour.
 */
export async function saveWalletAction(wallet: QuestWallet): Promise<void> {
  const uid = await getWriterId();
  if (!uid || !isFirebaseAdminConfigured) return;
  await saveWallet(uid, wallet);
}
