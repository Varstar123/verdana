import "server-only";
import type { FeedPost } from "@/lib/types";
import { TOP_PROFILES } from "@/lib/community";
import { isFirebaseAdminConfigured } from "@/lib/env";

/**
 * Community feed repository. Reads/writes Firestore via the Admin SDK when a
 * service account is configured; otherwise serves seeded demo posts (the client
 * keeps user-created posts in localStorage so the demo still feels live).
 */

const A = (i: number) => TOP_PROFILES[i % TOP_PROFILES.length];

const SEED_POSTS: FeedPost[] = [
  {
    id: "seed-p1",
    authorName: A(3).displayName,
    authorHue: A(3).avatarHue,
    authorPlanetId: A(3).planetId,
    body: "Planted 5 brazil-nut saplings in the Amazon Headwaters this weekend. The canopy corridor is really filling in 🌳",
    hashtags: ["PlantTrees", "ClimateAction"],
    likes: 142,
    likedByMe: false,
    comments: [
      {
        id: "seed-c1",
        authorName: A(1).displayName,
        authorHue: A(1).avatarHue,
        authorPlanetId: A(1).planetId,
        body: "Incredible work — adding this project to my list!",
        createdAt: "1h",
      },
    ],
    createdAt: "2h",
  },
  {
    id: "seed-p2",
    authorName: A(6).displayName,
    authorHue: A(6).avatarHue,
    authorPlanetId: A(6).planetId,
    body: "Beach cleanup crew pulled 12kg of plastic off the coast today. Small actions, big ripples 🌊♻️",
    hashtags: ["OceanCleanup", "ZeroWaste"],
    likes: 98,
    likedByMe: false,
    comments: [],
    createdAt: "5h",
  },
  {
    id: "seed-p3",
    authorName: A(9).displayName,
    authorHue: A(9).avatarHue,
    authorPlanetId: A(9).planetId,
    body: "Just hit a 100-day streak 🔥 Biked to work every day this month instead of driving. My Earth is looking greener!",
    hashtags: ["Streak", "ClimateAction"],
    likes: 211,
    likedByMe: false,
    comments: [
      {
        id: "seed-c2",
        authorName: A(2).displayName,
        authorHue: A(2).avatarHue,
        authorPlanetId: A(2).planetId,
        body: "Goals 🙌",
        createdAt: "3h",
      },
    ],
    createdAt: "8h",
  },
  {
    id: "seed-p4",
    authorName: A(12).displayName,
    authorHue: A(12).avatarHue,
    authorPlanetId: A(12).planetId,
    body: "Our community garden harvested its first crop of the season. Composting everything and starting a seed library next 🌱",
    hashtags: ["Gardening", "Recycling"],
    likes: 67,
    likedByMe: false,
    comments: [],
    createdAt: "1d",
  },
];

function relativeLabel(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface PostDoc {
  authorName?: string;
  authorHue?: number;
  authorPlanetId?: string;
  body?: string;
  hashtags?: string[];
  likes?: number;
  comments?: FeedPost["comments"];
  ts?: number;
}

function mapDoc(id: string, d: PostDoc): FeedPost {
  return {
    id,
    authorName: d.authorName ?? "Anonymous",
    authorHue: d.authorHue ?? 150,
    authorPlanetId: d.authorPlanetId ?? "VER-000000",
    body: d.body ?? "",
    hashtags: d.hashtags ?? [],
    likes: d.likes ?? 0,
    likedByMe: false,
    comments: d.comments ?? [],
    createdAt: relativeLabel(d.ts ?? Date.now()),
  };
}

export interface PostAuthor {
  name: string;
  hue: number;
  planetId: string;
}

export async function getFeed(userId?: string | null): Promise<FeedPost[]> {
  if (isFirebaseAdminConfigured) {
    try {
      const { getAdminDb } = await import("@/lib/firebase/admin");
      const db = getAdminDb();
      if (db) {
        const snap = await db
          .collection("posts")
          .orderBy("ts", "desc")
          .limit(50)
          .get();
        if (!snap.empty) {
          const liked = userId ? await getLikedPostIds(userId) : new Set<string>();
          return snap.docs.map((doc) => {
            const post = mapDoc(doc.id, doc.data());
            post.likedByMe = liked.has(doc.id);
            return post;
          });
        }
      }
    } catch {
      // fall through to demo
    }
  }
  return SEED_POSTS;
}

export async function createPost(
  author: PostAuthor,
  body: string,
  hashtags: string[],
): Promise<FeedPost> {
  const ts = Date.now();
  const post: FeedPost = {
    id: `p-${ts}`,
    authorName: author.name,
    authorHue: author.hue,
    authorPlanetId: author.planetId,
    body,
    hashtags,
    likes: 0,
    likedByMe: false,
    comments: [],
    createdAt: "now",
  };

  if (isFirebaseAdminConfigured) {
    try {
      const { getAdminDb } = await import("@/lib/firebase/admin");
      const db = getAdminDb();
      if (db) {
        const ref = await db.collection("posts").add({
          authorName: author.name,
          authorHue: author.hue,
          authorPlanetId: author.planetId,
          body,
          hashtags,
          likes: 0,
          comments: [],
          ts,
        });
        post.id = ref.id;
      }
    } catch {
      // demo: return the optimistic post (client persists locally)
    }
  }

  return post;
}

/**
 * Set whether `userId` likes `postId`. One like per user per post, enforced in a
 * transaction against a `postLikes/{userId}_{postId}` marker, so the like counter
 * can only move by ±1 per user and cannot be inflated by replaying the action.
 */
export async function setPostLike(
  userId: string,
  postId: string,
  liked: boolean,
): Promise<void> {
  if (!isFirebaseAdminConfigured) return;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const db = getAdminDb();
    if (!db) return;
    const likeRef = db.collection("postLikes").doc(`${userId}_${postId}`);
    const postRef = db.collection("posts").doc(postId);
    await db.runTransaction(async (tx) => {
      // Reads before writes. Skip seeded/placeholder posts that aren't real docs
      // (update() on a missing doc would throw NOT_FOUND and abort the tx).
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists) return;
      const already = (await tx.get(likeRef)).exists;
      if (liked && !already) {
        tx.set(likeRef, { userId, postId, ts: Date.now() });
        tx.update(postRef, { likes: FieldValue.increment(1) });
      } else if (!liked && already) {
        tx.delete(likeRef);
        tx.update(postRef, { likes: FieldValue.increment(-1) });
      }
    });
  } catch {
    /* no-op in demo */
  }
}

/** Post ids the user has liked, from the postLikes markers (to render like state). */
export async function getLikedPostIds(userId: string): Promise<Set<string>> {
  if (!isFirebaseAdminConfigured) return new Set();
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (!db) return new Set();
    const snap = await db
      .collection("postLikes")
      .where("userId", "==", userId)
      .limit(500)
      .get();
    return new Set(snap.docs.map((d) => d.data().postId as string));
  } catch {
    return new Set();
  }
}

/** Adds a comment and returns its id (the same id stored in Firestore). */
export async function commentOnPost(
  postId: string,
  author: PostAuthor,
  body: string,
): Promise<string> {
  const id = `c-${crypto.randomUUID()}`;
  if (!isFirebaseAdminConfigured) return id;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const db = getAdminDb();
    if (db) {
      await db
        .collection("posts")
        .doc(postId)
        .update({
          comments: FieldValue.arrayUnion({
            id,
            authorName: author.name,
            authorHue: author.hue,
            authorPlanetId: author.planetId,
            body,
            createdAt: new Date().toISOString(),
          }),
        });
    }
  } catch {
    /* no-op in demo */
  }
  return id;
}
