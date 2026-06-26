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

export async function getThreads(): Promise<ForumThread[]> {
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
        if (!snap.empty) return snap.docs.map((doc) => mapDoc(doc.id, doc.data()));
      }
    } catch {
      /* fall through */
    }
  }
  return SEED_THREADS;
}

export async function createThread(
  author: ThreadAuthor,
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
        const ref = await db.collection("forumThreads").add({
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
        thread.id = ref.id;
      }
    } catch {
      /* demo echo */
    }
  }
  return thread;
}

export async function voteThread(id: string, delta: number): Promise<void> {
  if (!isFirebaseAdminConfigured) return;
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const db = getAdminDb();
    if (db) {
      await db
        .collection("forumThreads")
        .doc(id)
        .update({ votes: FieldValue.increment(delta) });
    }
  } catch {
    /* no-op */
  }
}

export async function commentOnThread(
  id: string,
  author: ThreadAuthor,
  body: string,
): Promise<void> {
  if (!isFirebaseAdminConfigured) return;
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
            id: `c-${Date.now()}`,
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
}
