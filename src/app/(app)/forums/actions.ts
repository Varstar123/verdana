"use server";

import { requireWriter } from "@/lib/session";
import { getWriterId } from "@/lib/auth";
import { createThread, setThreadVote, commentOnThread, FORUM_CATEGORIES } from "@/lib/forums";
import { clampText, THREAD_TITLE_MAX, THREAD_BODY_MAX, COMMENT_BODY_MAX } from "@/lib/limits";
import type { FeedComment, ForumThread } from "@/lib/types";

export async function createThreadAction(
  categoryId: string,
  title: string,
  body: string,
): Promise<ForumThread> {
  const { profile } = await requireWriter();
  const uid = await getWriterId();
  const category = FORUM_CATEGORIES.some((c) => c.id === categoryId) ? categoryId : "general";
  const safeTitle = clampText(title, THREAD_TITLE_MAX);
  const safeBody = clampText(body, THREAD_BODY_MAX);
  if (!safeTitle || !safeBody) throw new Error("Title and body required");
  return createThread(
    { name: profile.displayName, hue: profile.avatarHue, planetId: profile.planetId },
    uid,
    category,
    safeTitle,
    safeBody,
  );
}

export async function voteThreadAction(id: string, vote: number): Promise<void> {
  // Actor from session; server stores the user's vote and applies only the
  // difference, so the score can move by at most one vote per user.
  const uid = await getWriterId();
  if (!uid) return;
  await setThreadVote(uid, id, vote);
}

export async function commentThreadAction(
  id: string,
  body: string,
): Promise<FeedComment> {
  const { profile } = await requireWriter();
  const text = clampText(body, COMMENT_BODY_MAX);
  if (!text) throw new Error("Empty comment");
  const commentId = await commentOnThread(
    id,
    { name: profile.displayName, hue: profile.avatarHue, planetId: profile.planetId },
    text,
  );
  return {
    id: commentId,
    authorName: profile.displayName,
    authorHue: profile.avatarHue,
    authorPlanetId: profile.planetId,
    body: text,
    createdAt: "now",
  };
}
