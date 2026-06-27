"use server";

import { requireWriter } from "@/lib/session";
import { getWriterId } from "@/lib/auth";
import { createPost, setPostLike, commentOnPost } from "@/lib/feed";
import { clampText, extractHashtags, POST_BODY_MAX, COMMENT_BODY_MAX } from "@/lib/limits";
import type { FeedComment, FeedPost } from "@/lib/types";

export async function createPostAction(body: string): Promise<FeedPost> {
  const { profile } = await requireWriter();
  const text = clampText(body, POST_BODY_MAX);
  if (!text) throw new Error("Empty post");
  // Hashtags are re-derived server-side from the (capped) body — never trusted
  // from the client.
  return createPost(
    { name: profile.displayName, hue: profile.avatarHue, planetId: profile.planetId },
    text,
    extractHashtags(text),
  );
}

export async function likePostAction(postId: string, liked: boolean): Promise<void> {
  // Actor comes from the session; the server tracks one like per user and
  // derives the ±1 itself, so the client cannot inflate the count.
  const uid = await getWriterId();
  if (!uid) return;
  await setPostLike(uid, postId, liked);
}

export async function commentAction(postId: string, body: string): Promise<FeedComment> {
  const { profile } = await requireWriter();
  const text = clampText(body, COMMENT_BODY_MAX);
  if (!text) throw new Error("Empty comment");
  const id = await commentOnPost(
    postId,
    { name: profile.displayName, hue: profile.avatarHue, planetId: profile.planetId },
    text,
  );
  return {
    id,
    authorName: profile.displayName,
    authorHue: profile.avatarHue,
    authorPlanetId: profile.planetId,
    body: text,
    createdAt: "now",
  };
}
