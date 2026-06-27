"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { DailyChallenge } from "@/lib/types";
import { CheckIcon, TargetIcon, BoltIcon, FlameIcon } from "@/components/icons";
import { completeChallengeAction } from "@/app/(app)/challenges/actions";

function todayKey() {
  return `verdana_challenges_${new Date().toISOString().slice(0, 10)}`;
}

export function ChallengesBoard({
  challenges,
  persisted,
  streak,
}: {
  challenges: DailyChallenge[];
  persisted: boolean;
  streak: number;
}) {
  const [done, setDone] = useState<string[]>([]);
  const [, startTransition] = useTransition();
  // Capture the date key once at mount so load + save always use the same key,
  // even if the session crosses midnight.
  const dateKeyRef = useRef("");

  useEffect(() => {
    dateKeyRef.current = todayKey();
    try {
      const raw = localStorage.getItem(dateKeyRef.current);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const totals = useMemo(() => {
    const completed = challenges.filter((c) => done.includes(c.id));
    return {
      xp: completed.reduce((s, c) => s + c.rewardXp, 0),
      coins: completed.reduce((s, c) => s + c.rewardCoins, 0),
      count: completed.length,
    };
  }, [challenges, done]);

  function complete(c: DailyChallenge) {
    if (done.includes(c.id)) return;
    const next = [...done, c.id];
    setDone(next);
    try {
      localStorage.setItem(dateKeyRef.current || todayKey(), JSON.stringify(next));
    } catch {
      /* ignore */
    }
    if (persisted) {
      startTransition(() => void completeChallengeAction(c.id));
    }
  }

  return (
    <div>
      {/* Tally */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile label="XP earned today" value={totals.xp} icon={<BoltIcon className="h-5 w-5" />} accent="#8B5CF6" />
        <Tile label="Coins" value={totals.coins} icon={<span className="text-lg">🪙</span>} accent="#E3B341" />
        <Tile label="Completed" value={`${totals.count}/${challenges.length}`} icon={<TargetIcon className="h-5 w-5" />} accent="#22A155" />
        <Tile label="Day streak" value={streak} icon={<FlameIcon className="h-5 w-5" />} accent="#FB923C" />
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {challenges.map((c) => {
          const isDone = done.includes(c.id);
          return (
            <div
              key={c.id}
              className={`card-glass flex items-center gap-4 p-4 transition-opacity ${isDone ? "opacity-70" : ""}`}
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  isDone ? "bg-brand text-white" : "bg-aurora-violet/12 text-aurora-violet"
                }`}
              >
                {isDone ? <CheckIcon className="h-5 w-5" /> : <TargetIcon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${isDone ? "text-muted line-through" : "text-ink"}`}>
                  {c.title}
                </p>
                <p className="truncate text-xs text-faint">{c.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-aurora-violet/12 px-2.5 py-1 text-xs font-semibold text-aurora-violet">
                +{c.rewardXp} XP
              </span>
              <button
                onClick={() => complete(c)}
                disabled={isDone}
                className={isDone ? "btn-secondary cursor-default" : "btn-primary"}
              >
                {isDone ? "Done" : "Complete"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-faint">
        {persisted
          ? "Completions sync to your profile and eco-score."
          : "Demo: completions are saved in this browser and reset daily. Sign in with Firebase to sync XP to your eco-score."}
      </p>
    </div>
  );
}

function Tile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="card-glass p-4">
      <span
        className="grid h-9 w-9 place-items-center rounded-lg text-white"
        style={{ background: accent }}
      >
        {icon}
      </span>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-faint">{label}</p>
    </div>
  );
}
