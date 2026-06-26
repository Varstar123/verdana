"use server";

import { getSession } from "@/lib/session";
import { createPost, likePost, commentOnPost } from "@/lib/feed";
import type { FeedComment, FeedPost } from "@/lib/types";

export async function createPostAction(
  body: string,
  hashtags: string[],
): Promise<FeedPost> {
  const { profile } = await getSession();
  return createPost(
    { name: profile.displayName, hue: profile.avatarHue, planetId: profile.planetId },
    body.trim(),
    hashtags,
  );
}

export async function likePostAction(postId: string, delta: number): Promise<void> {
  await likePost(postId, delta);
}

export async function commentAction(
  postId: string,
  body: string,
): Promise<FeedComment> {
  const { profile } = await getSession();
  await commentOnPost(
    postId,
    { name: profile.displayName, hue: profile.avatarHue, planetId: profile.planetId },
    body.trim(),
  );
  return {
    id: `c-${postId}-${body.length}`,
    authorName: profile.displayName,
    authorHue: profile.avatarHue,
    authorPlanetId: profile.planetId,
    body: body.trim(),
    createdAt: "now",
  };
}
