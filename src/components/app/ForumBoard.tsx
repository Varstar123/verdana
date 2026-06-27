"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import type { FeedComment, ForumCategory, ForumThread } from "@/lib/types";
import { Avatar } from "@/components/app/Avatar";
import { PlusIcon } from "@/components/icons";
import {
  createThreadAction,
  voteThreadAction,
  commentThreadAction,
} from "@/app/(app)/forums/actions";
import { THREAD_TITLE_MAX, THREAD_BODY_MAX, COMMENT_BODY_MAX } from "@/lib/limits";

const LS_KEY = "verdana_forum_threads";

interface Me {
  name: string;
  hue: number;
  planetId: string;
}

export function ForumBoard({
  initial,
  categories,
  me,
  persisted,
}: {
  initial: ForumThread[];
  categories: ForumCategory[];
  me: Me;
  persisted: boolean;
}) {
  const [threads, setThreads] = useState<ForumThread[]>(initial);
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [composeCat, setComposeCat] = useState(categories[0]?.id ?? "general");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (persisted) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setThreads([...(JSON.parse(raw) as ForumThread[]), ...initial]);
    } catch {
      /* ignore */
    }
  }, [initial, persisted]);

  const catMeta = (id: string) => categories.find((c) => c.id === id);
  const visible = cat === "all" ? threads : threads.filter((t) => t.categoryId === cat);

  function saveLocal(t: ForumThread) {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr: ForumThread[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(LS_KEY, JSON.stringify([t, ...arr]));
    } catch {
      /* ignore */
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const optimistic: ForumThread = {
      id: `tmp-${Date.now()}`,
      categoryId: composeCat,
      title: title.trim(),
      body: body.trim(),
      authorName: me.name,
      authorHue: me.hue,
      authorPlanetId: me.planetId,
      votes: 1,
      myVote: 1,
      comments: [],
      createdAt: "now",
    };
    setThreads((t) => [optimistic, ...t]);
    setTitle("");
    setBody("");
    setOpen(false);
    if (persisted) {
      startTransition(async () => {
        try {
          const saved = await createThreadAction(composeCat, optimistic.title, optimistic.body);
          setThreads((t) => t.map((x) => (x.id === optimistic.id ? saved : x)));
        } catch {
          /* keep the optimistic thread if the server rejects */
        }
      });
    } else {
      saveLocal(optimistic);
    }
  }

  function vote(id: string, dir: 1 | -1) {
    let nextVote = 0;
    setThreads((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        nextVote = t.myVote === dir ? 0 : dir;
        return { ...t, myVote: nextVote, votes: t.votes + (nextVote - t.myVote) };
      }),
    );
    if (persisted && !id.startsWith("tmp-")) {
      // Send the absolute vote state; the server applies only the difference.
      startTransition(() => void voteThreadAction(id, nextVote));
    }
  }

  function addComment(id: string, text: string) {
    const c: FeedComment = {
      id: `c-${Date.now()}`,
      authorName: me.name,
      authorHue: me.hue,
      authorPlanetId: me.planetId,
      body: text,
      createdAt: "now",
    };
    setThreads((ts) =>
      ts.map((t) => (t.id === id ? { ...t, comments: [...t.comments, c] } : t)),
    );
    if (persisted && !id.startsWith("tmp-")) {
      startTransition(() => {
        commentThreadAction(id, text).catch(() => {});
      });
    }
  }

  return (
    <div>
      {/* Category filter */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.emoji} {c.name}
          </Chip>
        ))}
      </div>

      {/* New thread */}
      <div className="mt-4">
        {open ? (
          <form onSubmit={submit} className="card-glass space-y-3 p-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={THREAD_TITLE_MAX}
              placeholder="Thread title"
              className="w-full rounded-xl border border-hairline/15 bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-brand/50"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={THREAD_BODY_MAX}
              placeholder="What's on your mind?"
              className="w-full resize-none rounded-xl border border-hairline/15 bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand/50"
            />
            <div className="flex items-center justify-between gap-2">
              <select
                value={composeCat}
                onChange={(e) => setComposeCat(e.target.value)}
                className="rounded-xl border border-hairline/15 bg-surface px-3 py-2 text-sm text-ink outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Post thread
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <PlusIcon className="h-4 w-4" /> New thread
          </button>
        )}
      </div>

      {/* Threads */}
      <div className="mt-5 space-y-3">
        {visible.map((t) => {
          const m = catMeta(t.categoryId);
          const isOpen = expanded === t.id;
          return (
            <div key={t.id} className="card-glass p-4">
              <div className="flex gap-3">
                {/* Vote column */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => vote(t.id, 1)}
                    className={`text-lg leading-none transition-colors ${t.myVote === 1 ? "text-brand" : "text-faint hover:text-ink"}`}
                    aria-label="Upvote"
                  >
                    ▲
                  </button>
                  <span className="text-sm font-semibold text-ink">{t.votes}</span>
                  <button
                    onClick={() => vote(t.id, -1)}
                    className={`text-lg leading-none transition-colors ${t.myVote === -1 ? "text-aurora-pink" : "text-faint hover:text-ink"}`}
                    aria-label="Downvote"
                  >
                    ▼
                  </button>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {m && (
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-muted">
                        {m.emoji} {m.name}
                      </span>
                    )}
                    <span className="text-xs text-faint">· {t.createdAt}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-semibold text-ink">
                    {t.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-faint">
                    <Link href={`/profile/${t.authorPlanetId}`} className="hover:underline">
                      {t.authorName}
                    </Link>
                  </div>

                  <button
                    onClick={() => setExpanded(isOpen ? null : t.id)}
                    className="mt-2 text-xs font-semibold text-brand hover:underline"
                  >
                    {isOpen ? "Hide" : `${t.comments.length} comments`}
                  </button>

                  {isOpen && (
                    <div className="mt-3 space-y-3 border-t border-hairline/10 pt-3">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
                        {t.body}
                      </p>
                      {t.comments.map((c) => (
                        <div key={c.id} className="flex gap-2">
                          <Avatar name={c.authorName} hue={c.authorHue} size={26} />
                          <div className="rounded-xl bg-ink/5 px-3 py-1.5">
                            <p className="text-xs font-semibold text-ink">{c.authorName}</p>
                            <p className="text-sm text-muted">{c.body}</p>
                          </div>
                        </div>
                      ))}
                      <CommentBox onSubmit={(text) => addComment(t.id, text)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-faint">
            No threads in this category yet — start one!
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-brand text-white"
          : "bg-surface text-muted ring-1 ring-inset ring-hairline/15 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function CommentBox({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text.trim());
        setText("");
      }}
      className="flex gap-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={COMMENT_BODY_MAX}
        placeholder="Add a comment…"
        className="flex-1 rounded-full border border-hairline/15 bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand/50"
      />
      <button type="submit" disabled={!text.trim()} className="btn-secondary">
        Reply
      </button>
    </form>
  );
}
