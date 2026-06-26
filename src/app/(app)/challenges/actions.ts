"use server";

import { isClerkConfigured } from "@/lib/env";
import { completeChallengeInDb } from "@/lib/challenges";

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

export async function completeChallengeAction(
  challengeId: string,
  xp: number,
): Promise<void> {
  const uid = await currentUserId();
  if (uid) await completeChallengeInDb(uid, challengeId, xp);
}
