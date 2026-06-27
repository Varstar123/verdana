"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { FeedPost } from "@/lib/types";
import { Avatar } from "@/components/app/Avatar";
import { HeartIcon, PlusIcon } from "@/components/icons";
import {
  createPostAction,
  likePostAction,
  commentAction,
} from "@/app/(app)/community/actions";
import { POST_BODY_MAX, COMMENT_BODY_MAX, extractHashtags } from "@/lib/limits";

const LS_KEY = "verdana_demo_posts";

interface Me {
  name: string;
  hue: number;
  planetId: string;
}

function relLabel(ms: number): string {
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function mapLiveDoc(id: string, d: Record<string, unknown>): FeedPost {
  return {
    id,
    authorName: (d.authorName as string) ?? "Anonymous",
    authorHue: (d.authorHue as number) ?? 150,
    authorPlanetId: (d.authorPlanetId as string) ?? "VER-000000",
    body: (d.body as string) ?? "",
    hashtags: (d.hashtags as string[]) ?? [],
    likes: (d.likes as number) ?? 0,
    likedByMe: false,
    comments: (d.comments as FeedPost["comments"]) ?? [],
    createdAt: relLabel((d.ts as number) ?? Date.now()),
  };
}

export function CommunityFeed({
  initial,
  me,
  persisted,
  realtime = false,
}: {
  initial: FeedPost[];
  me: Me;
  persisted: boolean;
  realtime?: boolean;
}) {
  const [posts, setPosts] = useState<FeedPost[]>(initial);
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();

  // Merge locally-saved demo posts on mount (demo mode persistence).
  useEffect(() => {
    if (persisted) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const local: FeedPost[] = JSON.parse(raw);
        setPosts([...local, ...initial]);
      }
    } catch {
      /* ignore */
    }
  }, [initial, persisted]);

  // Real-time feed: subscribe to Firestore when configured.
  useEffect(() => {
    if (!realtime) return;
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      try {
        const { getDb } = await import("@/lib/firebase/client");
        const db = getDb();
        if (!db || cancelled) return;
        const { collection, query, orderBy, limit, onSnapshot } = await import(
          "firebase/firestore"
        );
        const q = query(collection(db, "posts"), orderBy("ts", "desc"), limit(50));
        unsub = onSnapshot(q, (snap) => {
          if (snap.empty) return; // keep seeded initial until real posts exist
          // Preserve the viewer's own like state across live updates — the client
          // can't read the (locked) postLikes markers, so carry it from prior state.
          setPosts((prev) =>
            snap.docs.map((d) => {
              const post = mapLiveDoc(d.id, d.data());
              const existing = prev.find((p) => p.id === d.id);
              return existing ? { ...post, likedByMe: existing.likedByMe } : post;
            }),
          );
        });
      } catch {
        /* stay on server-rendered feed */
      }
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, [realtime]);

  function saveLocal(next: FeedPost[]) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const hashtags = extractHashtags(body);
    const optimistic: FeedPost = {
      id: `tmp-${Date.now()}`,
      authorName: me.name,
      authorHue: me.hue,
      authorPlanetId: me.planetId,
      body,
      hashtags,
      likes: 0,
      likedByMe: false,
      comments: [],
      createdAt: "now",
    };
    setPosts((p) => [optimistic, ...p]);
    setDraft("");

    if (persisted) {
      startTransition(async () => {
        try {
          const saved = await createPostAction(body);
          setPosts((p) => p.map((x) => (x.id === optimistic.id ? saved : x)));
        } catch {
          /* keep the optimistic post if the server rejects (e.g. signed out) */
        }
      });
    } else {
      // demo: persist this user's posts locally
      try {
        const raw = localStorage.getItem(LS_KEY);
        const local: FeedPost[] = raw ? JSON.parse(raw) : [];
        saveLocal([optimistic, ...local]);
      } catch {
        /* ignore */
      }
    }
  }

  function toggleLike(id: string) {
    let nextLiked = false;
    setPosts((p) =>
      p.map((x) => {
        if (x.id !== id) return x;
        nextLiked = !x.likedByMe;
        return { ...x, likedByMe: nextLiked, likes: x.likes + (nextLiked ? 1 : -1) };
      }),
    );
    if (persisted && !id.startsWith("tmp-")) {
      // Send the desired like state; the server tracks per-user likes and ±1.
      startTransition(() => void likePostAction(id, nextLiked));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Composer */}
      <form onSubmit={submit} className="card-glass p-4">
        <div className="flex gap-3">
          <Avatar name={me.name} hue={me.hue} size={40} />
          <div className="flex-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={POST_BODY_MAX}
              placeholder="Share an action, a win, a before/after… use #hashtags"
              className="w-full resize-none rounded-xl border border-hairline/15 bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {extractHashtags(draft).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-brand/12 px-2 py-0.5 text-xs font-medium text-brand"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <button type="submit" disabled={!draft.trim()} className="btn-primary">
                <PlusIcon className="h-4 w-4" />
                Post
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Feed */}
      <div className="mt-5 space-y-4">
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <motion.article
              key={post.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass p-5"
            >
              <header className="flex items-center gap-3">
                <Link href={`/profile/${post.authorPlanetId}`}>
                  <Avatar name={post.authorName} hue={post.authorHue} size={42} />
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/profile/${post.authorPlanetId}`}
                    className="text-sm font-semibold text-ink hover:underline"
                  >
                    {post.authorName}
                  </Link>
                  <p className="font-mono text-xs text-faint">
                    {post.authorPlanetId} · {post.createdAt}
                  </p>
                </div>
              </header>

              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink/90">
                {post.body}
              </p>

              {post.hashtags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.hashtags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <footer className="mt-4 flex items-center gap-4 border-t border-hairline/10 pt-3 text-sm">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`inline-flex items-center gap-1.5 transition-colors ${
                    post.likedByMe ? "text-aurora-pink" : "text-muted hover:text-ink"
                  }`}
                >
                  <HeartIcon className="h-4 w-4" />
                  {post.likes}
                </button>
                <CommentThread post={post} me={me} persisted={persisted} setPosts={setPosts} />
              </footer>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CommentThread({
  post,
  me,
  persisted,
  setPosts,
}: {
  post: FeedPost;
  me: Me;
  persisted: boolean;
  setPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [, startTransition] = useTransition();

  function addComment(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    const optimistic = {
      id: `c-${Date.now()}`,
      authorName: me.name,
      authorHue: me.hue,
      authorPlanetId: me.planetId,
      body,
      createdAt: "now",
    };
    setPosts((p) =>
      p.map((x) =>
        x.id === post.id ? { ...x, comments: [...x.comments, optimistic] } : x,
      ),
    );
    setText("");
    if (persisted && !post.id.startsWith("tmp-")) {
      startTransition(() => {
        commentAction(post.id, body).catch(() => {});
      });
    }
  }

  return (
    <div className="flex-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-muted transition-colors hover:text-ink"
      >
        💬 {post.comments.length}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar name={c.authorName} hue={c.authorHue} size={28} />
              <div className="rounded-xl bg-ink/5 px-3 py-2">
                <p className="text-xs font-semibold text-ink">{c.authorName}</p>
                <p className="text-sm text-muted">{c.body}</p>
              </div>
            </div>
          ))}
          <form onSubmit={addComment} className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={COMMENT_BODY_MAX}
              placeholder="Add a comment…"
              className="flex-1 rounded-full border border-hairline/15 bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand/50"
            />
            <button type="submit" disabled={!text.trim()} className="btn-secondary">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
