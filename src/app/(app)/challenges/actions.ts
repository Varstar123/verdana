"use server";

import { getWriterId } from "@/lib/auth";
import { completeChallengeInDb } from "@/lib/challenges";
import { DAILY_CHALLENGES } from "@/lib/community";

/**
 * Mark today's challenge complete. The reward is looked up server-side from the
 * authoritative challenge list by id — the browser never gets to say how much XP
 * it earns. Completion is idempotent per day (see completeChallengeInDb).
 */
export async function completeChallengeAction(challengeId: string): Promise<void> {
  const uid = await getWriterId();
  if (!uid) return;
  const challenge = DAILY_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) return; // unknown challenge id — ignore
  await completeChallengeInDb(uid, challengeId, challenge.rewardXp);
}
