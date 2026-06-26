"use server";

import { getSession } from "@/lib/session";
import { createThread, voteThread, commentOnThread } from "@/lib/forums";
import type { FeedComment, ForumThread } from "@/lib/types";

export async function createThreadAction(
  categoryId: string,
  title: string,
  body: string,
): Promise<ForumThread> {
  const { profile } = await getSession();
  return createThread(
    { name: profile.displayName, hue: profile.avatarHue, planetId: profile.planetId },
    categoryId,
    title.trim(),
    body.trim(),
  );
}

export async function voteThreadAction(id: string, delta: number): Promise<void> {
  await voteThread(id, delta);
}

export async function commentThreadAction(
  id: string,
  body: string,
): Promise<FeedComment> {
  const { profile } = await getSession();
  await commentOnThread(
    id,
    { name: profile.displayName, hue: profile.avatarHue, planetId: profile.planetId },
    body.trim(),
  );
  return {
    id: `c-${id}-${body.length}`,
    authorName: profile.displayName,
    authorHue: profile.avatarHue,
    authorPlanetId: profile.planetId,
    body: body.trim(),
    createdAt: "now",
  };
}
