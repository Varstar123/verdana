import "server-only";
import type { ForumCategory, ForumThread } from "@/lib/types";
import { TOP_PROFILES } from "@/lib/community";
import { isFirebaseAdminConfigured } from "@/lib/env";

/**
 * Eco Forums repository. Reads/writes Firestore via the Admin SDK when a service
 * account is configured; otherwise serves seeded demo threads (client keeps
 * user-created threads + votes in localStorage).
 */

export const FORUM_CATEGORIES: ForumCategory[] = [
  { id: "general", name: "General", emoji: "💬" },
  { id: "news", name: "Climate News", emoji: "📰" },
  { id: "gardening", name: "Gardening", emoji: "🌷" },
  { id: "recycling", name: "Recycling", emoji: "♻️" },
  { id: "energy", name: "Renewable Energy", emoji: "⚡" },
  { id: "trees", name: "Tree Planting", emoji: "🌳" },
  { id: "ocean", name: "Ocean Cleanup", emoji: "🌊" },
  { id: "ideas", name: "Ideas", emoji: "💡" },
  { id: "questions", name: "Questions", emoji: "❓" },
  { id: "success", name: "Success Stories", emoji: "🏆" },
  { id: "local", name: "Local Communities", emoji: "📍" },
];

const A = (i: number) => TOP_PROFILES[i % TOP_PROFILES.length];

const SEED_THREADS: ForumThread[] = [
  {
    id: "t1",
    categoryId: "trees",
    title: "Best native species for reforesting dry tropical land?",
    body: "Starting a 2-hectare plot in a dry region. Looking for resilient natives that establish without heavy irrigation. What's worked for you?",
    authorName: A(2).displayName,
    authorHue: A(2).avatarHue,
    authorPlanetId: A(2).planetId,
    votes: 47,
    myVote: 0,
    comments: [
      {
        id: "tc1",
        authorName: A(5).displayName,
        authorHue: A(5).avatarHue,
        authorPlanetId: A(5).planetId,
        body: "Acacia + mesquite did great for us — deep roots, drought tolerant.",
        createdAt: "3h",
      },
    ],
    createdAt: "6h",
  },
  {
    id: "t2",
    categoryId: "recycling",
    title: "How do you actually recycle soft plastics?",
    body: "Curbside won't take them here. Found a store drop-off program — curious what others do.",
    authorName: A(7).displayName,
    authorHue: A(7).avatarHue,
    authorPlanetId: A(7).planetId,
    votes: 31,
    myVote: 0,
    comments: [],
    createdAt: "10h",
  },
  {
    id: "t3",
    categoryId: "success",
    title: "Our neighborhood cleanup removed 300kg in one weekend 🎉",
    body: "40 volunteers, 6 hours, one very happy beach. Sharing our playbook if anyone wants to run one.",
    authorName: A(10).displayName,
    authorHue: A(10).avatarHue,
    authorPlanetId: A(10).planetId,
    votes: 88,
    myVote: 0,
    comments: [
      {
        id: "tc2",
        authorName: A(1).displayName,
        authorHue: A(1).avatarHue,
        authorPlanetId: A(1).planetId,
        body: "Please share the playbook!",
        createdAt: "2h",
      },
    ],
    createdAt: "1d",
  },
  {
    id: "t4",
    categoryId: "energy",
    title: "Rooftop solar — was it worth it for you?",
    body: "Weighing the upfront cost vs payback. Real numbers appreciated.",
    authorName: A(4).displayName,
    authorHue: A(4).avatarHue,
    authorPlanetId: A(4).planetId,
    votes: 25,
    myVote: 0,
    comments: [],
    createdAt: "1d",
  },
];

function relativeLabel(ms: number): string {
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface ThreadDoc {
  categoryId?: string;
  title?: string;
  body?: string;
  authorName?: string;
  authorHue?: number;
  authorPlanetId?: string;
  votes?: number;
  comments?: ForumThread["comments"];
  ts?: number;
}

function mapDoc(id: string, d: ThreadDoc): ForumThread {
  return {
    id,
    categoryId: d.categoryId ?? "general",
    title: d.title ?? "",
    body: d.body ?? "",
    authorName: d.authorName ?? "Anonymous",
    authorHue: d.authorHue ?? 150,
    authorPlanetId: d.authorPlanetId ?? "VER-000000",
    votes: d.votes ?? 0,
    myVote: 0,
    comments: d.comments ?? [],
    createdAt: relativeLabel(d.ts ?? Date.now()),
  };
}

export interface ThreadAuthor {
  name: string;
  hue: number;
  planetId: string;
}

/** The user's vote per thread, from the forumVotes markers (to render vote state). */
export async function getUserThreadVotes(userId: string): Promise<Map<string, number>> {
  const votes = new Map<string, number>();
  if (!isFirebaseAdminConfigured) return votes;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (!db) return votes;
    const snap = await db
      .collection("forumVotes")
      .where("userId", "==", userId)
      .limit(500)
      .get();
    for (const d of snap.docs) votes.set(d.data().threadId as string, Number(d.data().vote ?? 0));
    return votes;
  } catch {
    return votes;
  }
}

export async function getThreads(userId?: string | null): Promise<ForumThread[]> {
  if (isFirebaseAdminConfigured) {
    try {
      const { getAdminDb } = await import("@/lib/firebase/admin");
      const db = getAdminDb();
      if (db) {
        const snap = await db
          .collection("forumThreads")
          .orderBy("ts", "desc")
          .limit(80)
          .get();
        if (!snap.empty) {
          const myVotes = userId ? await getUserThreadVotes(userId) : new Map<string, number>();
          return snap.docs.map((doc) => {
            const thread = mapDoc(doc.id, doc.data());
            thread.myVote = myVotes.get(doc.id) ?? 0;
            return thread;
          });
        }
      }
    } catch {
      /* fall through */
    }
  }
  return SEED_THREADS;
}

export async function createThread(
  author: ThreadAuthor,
  authorUserId: string | null,
  categoryId: string,
  title: string,
  body: string,
): Promise<ForumThread> {
  const ts = Date.now();
  const thread: ForumThread = {
    id: `t-${ts}`,
    categoryId,
    title,
    body,
    authorName: author.name,
    authorHue: author.hue,
    authorPlanetId: author.planetId,
    votes: 1,
    myVote: 1,
    comments: [],
    createdAt: "now",
  };
  if (isFirebaseAdminConfigured) {
    try {
      const { getAdminDb } = await import("@/lib/firebase/admin");
      const db = getAdminDb();
      if (db) {
        // Pre-generate the id so the author's implicit upvote marker matches the
        // votes:1 seed — keeping votes == sum(markers) so the count can't drift.
        const threadRef = db.collection("forumThreads").doc();
        const batch = db.batch();
        batch.set(threadRef, {
          categoryId,
          title,
          body,
          authorName: author.name,
          authorHue: author.hue,
          authorPlanetId: author.planetId,
          votes: 1,
          comments: [],
          ts,
        });
        if (authorUserId) {
          batch.set(db.collection("forumVotes").doc(`${authorUserId}_${threadRef.id}`), {
            userId: authorUserId,
            threadId: threadRef.id,
            vote: 1,
            ts,
          });
        }
        await batch.commit();
        thread.id = threadRef.id;
      }
    } catch {
      /* demo echo */
    }
  }
  return thread;
}

/**
 * Set `userId`'s vote on a thread to one of {-1, 0, 1}. The server records each
 * user's current vote in `forumVotes/{userId}_{threadId}` and applies only the
 * difference in a transaction, so a user can shift the score by at most one vote
 * and replays are idempotent — the count cannot be inflated from the client.
 */
export async function setThreadVote(
  userId: string,
  threadId: string,
  vote: number,
): Promise<void> {
  if (!isFirebaseAdminConfigured) return;
  const v = vote > 0 ? 1 : vote < 0 ? -1 : 0; // clamp to {-1, 0, 1}
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const db = getAdminDb();
    if (!db) return;
    const voteRef = db.collection("forumVotes").doc(`${userId}_${threadId}`);
    const threadRef = db.collection("forumThreads").doc(threadId);
    await db.runTransaction(async (tx) => {
      // Reads before writes. Skip seeded/placeholder threads that aren't real docs.
      const threadSnap = await tx.get(threadRef);
      if (!threadSnap.exists) return;
      const snap = await tx.get(voteRef);
      const prev = snap.exists ? Number(snap.data()?.vote ?? 0) : 0;
      const delta = v - prev;
      if (delta === 0) return;
      if (v === 0) tx.delete(voteRef);
      else tx.set(voteRef, { userId, threadId, vote: v, ts: Date.now() });
      tx.update(threadRef, { votes: FieldValue.increment(delta) });
    });
  } catch {
    /* no-op */
  }
}

/** Adds a comment and returns its id (the same id stored in Firestore). */
export async function commentOnThread(
  id: string,
  author: ThreadAuthor,
  body: string,
): Promise<string> {
  const commentId = `c-${crypto.randomUUID()}`;
  if (!isFirebaseAdminConfigured) return commentId;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const db = getAdminDb();
    if (db) {
      await db
        .collection("forumThreads")
        .doc(id)
        .update({
          comments: FieldValue.arrayUnion({
            id: commentId,
            authorName: author.name,
            authorHue: author.hue,
            authorPlanetId: author.planetId,
            body,
            createdAt: new Date().toISOString(),
          }),
        });
    }
  } catch {
    /* no-op */
  }
  return commentId;
}
