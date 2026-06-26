"use client";

import { useState } from "react";
import type { DailyChallenge } from "@/lib/types";
import { PlusIcon, CheckIcon, TargetIcon } from "@/components/icons";

interface Row extends DailyChallenge {
  active: boolean;
}

export function ChallengeManager({ initial }: { initial: DailyChallenge[] }) {
  const [rows, setRows] = useState<Row[]>(
    initial.map((c) => ({ ...c, active: true })),
  );
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [xp, setXp] = useState(50);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setRows((rs) => [
      {
        id: `new-${rs.length}-${title.length}`,
        title: title.trim(),
        description: desc.trim() || "New daily challenge.",
        type: "challenge",
        rewardXp: xp,
        rewardCoins: Math.round(xp / 4),
        done: false,
        active: true,
      },
      ...rs,
    ]);
    setTitle("");
    setDesc("");
    setXp(50);
  }

  function toggle(id: string) {
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* List */}
      <div className="space-y-3">
        {rows.map((c) => (
          <div
            key={c.id}
            className={`card-glass flex items-center gap-4 p-4 ${c.active ? "" : "opacity-60"}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-aurora-violet/12 text-aurora-violet">
              <TargetIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{c.title}</p>
              <p className="truncate text-xs text-faint">{c.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-aurora-violet/12 px-2.5 py-1 text-xs font-semibold text-aurora-violet">
              +{c.rewardXp} XP
            </span>
            <button
              onClick={() => toggle(c.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                c.active
                  ? "bg-[#22A155]/12 text-[#22A155]"
                  : "bg-ink/5 text-faint"
              }`}
            >
              {c.active ? "Active" : "Paused"}
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <form onSubmit={add} className="card-glass h-fit space-y-3 p-6">
        <p className="eyebrow">New challenge</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Challenge title"
          className="w-full rounded-xl border border-hairline/15 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          placeholder="Short description"
          className="w-full rounded-xl border border-hairline/15 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
        />
        <label className="block text-sm text-muted">
          Reward XP
          <input
            type="number"
            min={10}
            max={500}
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-hairline/15 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <button type="submit" className="btn-primary w-full">
          <PlusIcon className="h-4 w-4" />
          Add challenge
        </button>
        <p className="flex items-center gap-1.5 text-xs text-faint">
          <CheckIcon className="h-3.5 w-3.5" />
          Demo only — persist via Firestore to publish to users.
        </p>
      </form>
    </div>
  );
}
