"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Quest, QuestStep, QuestTask } from "@/lib/types";
import {
  COINS_PER_REAL_TREE,
  REAL_TREE_PROJECTS,
  MASCOT_CHEERS,
  type RealTreeProject,
} from "@/lib/quests";
import { CheckIcon, SparkIcon, ArrowRightIcon } from "@/components/icons";

/* ---------------------------------------------------------------------------
 * Wallet — the whole quests economy, persisted in localStorage so it survives
 * reloads. Daily tasks are keyed by date (they reset each day); quest progress
 * and the coin/point balances persist. Uploaded photos are sent to the server
 * for a quick AI review and then discarded — never stored; only completion
 * metadata is kept, here in localStorage.
 * ------------------------------------------------------------------------- */

const STORAGE_KEY = "verdana_quests_v1";

interface Wallet {
  coins: number; // spendable in-app money
  xp: number; // lifetime Sprout Points
  treesFunded: number; // real trees funded by redeeming coins
  dailyDone: Record<string, string[]>; // dateKey -> completed task ids
  questSteps: Record<string, string[]>; // questId -> completed step ids
  questsBonus: string[]; // questIds whose finishing bonus was claimed
}

/** A brand-new, empty wallet (fresh nested objects each call). */
function freshWallet(): Wallet {
  return {
    coins: 0,
    xp: 0,
    treesFunded: 0,
    dailyDone: {},
    questSteps: {},
    questsBonus: [],
  };
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadWallet(): Wallet {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshWallet();
    const parsed = JSON.parse(raw) as Partial<Wallet>;
    return {
      coins: parsed.coins ?? 0,
      xp: parsed.xp ?? 0,
      treesFunded: parsed.treesFunded ?? 0,
      dailyDone: parsed.dailyDone ?? {},
      questSteps: parsed.questSteps ?? {},
      questsBonus: parsed.questsBonus ?? [],
    };
  } catch {
    return freshWallet();
  }
}

/* ---------------------------------------------------------------------------
 * AI photo review — send the proof photo to the server, which asks Claude
 * whether it genuinely shows the task. The photo is downscaled first (smaller,
 * faster, more private) and never stored anywhere.
 * ------------------------------------------------------------------------- */

type Verdict = {
  status: "pass" | "unsure" | "fail" | "unconfigured" | "error";
  reason: string;
};

type ReviewTarget =
  | { kind: "task"; taskId: string }
  | { kind: "step"; questId: string; stepId: string };

/** Draw the image to a canvas at ≤1024px and re-encode as JPEG to shrink it. */
async function downscaleImage(file: File, max = 1024): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    return blob ?? file;
  } catch {
    return file; // fall back to the original; the server validates the type
  }
}

async function reviewPhoto(target: ReviewTarget, file: File): Promise<Verdict> {
  try {
    const blob = await downscaleImage(file);
    const form = new FormData();
    form.set("kind", target.kind);
    if (target.kind === "task") {
      form.set("taskId", target.taskId);
    } else {
      form.set("questId", target.questId);
      form.set("stepId", target.stepId);
    }
    form.set("image", blob, "proof.jpg");
    const res = await fetch("/api/quests/verify", { method: "POST", body: form });
    if (!res.ok) return { status: "error", reason: "Review failed — please try again." };
    return (await res.json()) as Verdict;
  } catch {
    return { status: "error", reason: "Couldn't review that photo — please try again." };
  }
}

/* ---------------------------------------------------------------------------
 * Board
 * ------------------------------------------------------------------------- */

interface Flash {
  key: number;
  emoji: string;
  text: string;
  big?: boolean;
}

export function QuestBoard({
  tasks,
  quests,
}: {
  tasks: QuestTask[];
  quests: Quest[];
}) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [flash, setFlash] = useState<Flash | null>(null);
  const flashId = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cheer = useRef(0);
  const redeemRef = useRef<HTMLDivElement>(null);

  // Load once on mount (keeps SSR markup stable → no hydration mismatch).
  useEffect(() => {
    setWallet(loadWallet());
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!wallet) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [wallet]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  function showFlash(emoji: string, text: string, big = false) {
    flashId.current += 1;
    setFlash({ key: flashId.current, emoji, text, big });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), big ? 3200 : 2100);
  }

  function nextCheer(): string {
    const line = MASCOT_CHEERS[cheer.current % MASCOT_CHEERS.length];
    cheer.current += 1;
    return line;
  }

  const today = todayKey();
  const doneToday = wallet?.dailyDone[today] ?? [];

  function completeTask(task: QuestTask) {
    setWallet((w) => {
      if (!w) return w;
      const list = w.dailyDone[today] ?? [];
      if (list.includes(task.id)) return w;
      return {
        ...w,
        coins: w.coins + task.rewardCoins,
        xp: w.xp + task.rewardXp,
        dailyDone: { ...w.dailyDone, [today]: [...list, task.id] },
      };
    });
    showFlash("🪙", `+${task.rewardCoins} coins · +${task.rewardXp} pts — ${nextCheer()}`);
  }

  function completeStep(quest: Quest, step: QuestStep) {
    setWallet((w) => {
      if (!w) return w;
      const done = w.questSteps[quest.id] ?? [];
      if (done.includes(step.id)) return w;
      const nextDone = [...done, step.id];
      const allDone = quest.steps.every((s) => nextDone.includes(s.id));
      const claimsBonus = allDone && !w.questsBonus.includes(quest.id);
      return {
        ...w,
        coins: w.coins + step.rewardCoins + (claimsBonus ? quest.bonusCoins : 0),
        xp: w.xp + step.rewardXp + (claimsBonus ? quest.bonusXp : 0),
        questSteps: { ...w.questSteps, [quest.id]: nextDone },
        questsBonus: claimsBonus ? [...w.questsBonus, quest.id] : w.questsBonus,
      };
    });
    // Decide messaging from the pre-update snapshot.
    const done = wallet?.questSteps[quest.id] ?? [];
    const willComplete =
      quest.steps.every((s) => [...done, step.id].includes(s.id)) &&
      !(wallet?.questsBonus.includes(quest.id) ?? false);
    if (willComplete) {
      showFlash(
        "🎉",
        `Quest complete! +${quest.bonusCoins} bonus coins · Unlocked ${quest.reward}`,
        true,
      );
    } else {
      showFlash("🪙", `+${step.rewardCoins} coins · +${step.rewardXp} pts — ${nextCheer()}`);
    }
  }

  function redeemTree(project: RealTreeProject) {
    if (!wallet || wallet.coins < COINS_PER_REAL_TREE) return;
    setWallet((w) =>
      w && w.coins >= COINS_PER_REAL_TREE
        ? { ...w, coins: w.coins - COINS_PER_REAL_TREE, treesFunded: w.treesFunded + 1 }
        : w,
    );
    showFlash("🌳", `You funded a real tree in ${project.name}! Thank you 💚`, true);
  }

  // Route an AI verdict: award on a pass (or demo auto-pass), otherwise flash a
  // friendly nudge and let the user try again.
  function reviewAward(v: Verdict, award: () => void) {
    if (v.status === "pass" || v.status === "unconfigured") {
      award();
    } else if (v.status === "fail") {
      showFlash("❌", v.reason);
    } else if (v.status === "unsure") {
      showFlash("🤔", v.reason);
    } else {
      showFlash("⚠️", v.reason);
    }
  }

  const coins = wallet?.coins ?? 0;
  const xp = wallet?.xp ?? 0;
  const treesFunded = wallet?.treesFunded ?? 0;
  const towardNext = coins % COINS_PER_REAL_TREE;
  const pctToNext = Math.round((towardNext / COINS_PER_REAL_TREE) * 100);
  const coinsToNext = COINS_PER_REAL_TREE - towardNext;
  const canRedeem = coins >= COINS_PER_REAL_TREE;

  return (
    <div className="space-y-8">
      {/* Wallet */}
      <section className="card-glass relative overflow-hidden p-6 sm:p-8">
        <div className="aurora-bg opacity-50" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Your Green Wallet</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
              Turn small actions into real trees
            </h2>
          </div>
          <button
            onClick={() =>
              redeemRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="btn-primary"
            disabled={!canRedeem}
          >
            🌳 Plant a real tree
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <WalletTile emoji="🪙" label="Green Coins" value={coins} accent="#E3B341" pop />
          <WalletTile emoji="✨" label="Sprout Points" value={xp} accent="#8B5CF6" pop />
          <WalletTile emoji="🌳" label="Real trees funded" value={treesFunded} accent="#22A155" />
        </div>

        {/* Progress to next real tree */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Next real tree</span>
            <span className="text-muted">
              {canRedeem ? (
                <span className="font-semibold text-brand">Ready to plant! 🎉</span>
              ) : (
                <>
                  <span className="font-semibold text-ink">{coinsToNext}</span> coins to go
                </>
              )}
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink/10">
            <motion.div
              className="h-full rounded-full bg-brand-gradient"
              initial={false}
              animate={{ width: `${canRedeem ? 100 : pctToNext}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <p className="mt-2 text-xs text-faint">
            Every {COINS_PER_REAL_TREE} Green Coins = one real tree planted with a partner project.
          </p>
        </div>
      </section>

      {/* Daily tasks */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Daily tasks · resets at midnight</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink">
              Today&apos;s eco-missions 🌱
            </h2>
          </div>
          <span className="rounded-full bg-brand/12 px-3 py-1 text-xs font-semibold text-brand">
            {doneToday.length}/{tasks.length} done
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              done={doneToday.includes(task.id)}
              onResult={(v) => reviewAward(v, () => completeTask(task))}
            />
          ))}
        </div>
      </section>

      {/* Quests */}
      <section>
        <div className="mb-4">
          <p className="eyebrow">Quests · multi-step journeys</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink">
            Bigger adventures, bigger rewards 🏆
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              doneSteps={wallet?.questSteps[quest.id] ?? []}
              onStepResult={(step, v) => reviewAward(v, () => completeStep(quest, step))}
            />
          ))}
        </div>
      </section>

      {/* Redeem real trees */}
      <section ref={redeemRef} className="scroll-mt-20">
        <div className="mb-4">
          <p className="eyebrow">Spend your coins</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink">
            Plant a real tree 🌍
          </h2>
          <p className="mt-1 text-sm text-muted">
            Redeem {COINS_PER_REAL_TREE} Green Coins and we&apos;ll plant a real tree in your
            name with one of our partner projects.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REAL_TREE_PROJECTS.map((project) => (
            <div key={project.id} className="card-glass flex flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand/12 text-2xl">
                  {project.emoji}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-ink">
                    {project.name}
                  </p>
                  <p className="text-xs text-faint">{project.country}</p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{project.blurb}</p>
              <button
                onClick={() => redeemTree(project)}
                disabled={!canRedeem}
                className={`mt-4 ${canRedeem ? "btn-primary" : "btn-secondary cursor-not-allowed"}`}
              >
                {canRedeem ? (
                  <>Plant 1 tree · {COINS_PER_REAL_TREE} 🪙</>
                ) : (
                  <>Need {coinsToNext} more 🪙</>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-faint">
        Your quest progress and coins are saved in this browser. Uploaded photos are checked
        by AI to confirm the task, then discarded — never stored. We only record that a task
        was completed.
      </p>

      {/* Reward flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.key}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex w-fit max-w-[92vw] items-center gap-3 rounded-2xl border border-hairline/15 bg-elevated px-5 py-3 shadow-lift lg:bottom-8"
          >
            <motion.span
              className="text-2xl"
              initial={{ rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
            >
              {flash.emoji}
            </motion.span>
            <span
              className={`font-medium ${flash.big ? "text-base text-ink" : "text-sm text-ink"}`}
            >
              {flash.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Sub-components
 * ------------------------------------------------------------------------- */

function WalletTile({
  emoji,
  label,
  value,
  accent,
  pop = false,
}: {
  emoji: string;
  label: string;
  value: number;
  accent: string;
  pop?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-hairline/10 bg-surface/70 p-4">
      <div className="flex items-center gap-2">
        <span
          className="grid h-9 w-9 place-items-center rounded-lg text-lg"
          style={{ background: `${accent}22` }}
        >
          {emoji}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-faint">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-ink">
        {pop ? (
          <motion.span
            key={value}
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
            className="inline-block"
          >
            {value.toLocaleString()}
          </motion.span>
        ) : (
          value.toLocaleString()
        )}
      </p>
    </div>
  );
}

function TaskCard({
  task,
  done,
  onResult,
}: {
  task: QuestTask;
  done: boolean;
  onResult: (v: Verdict) => void;
}) {
  return (
    <div
      className={`card-glass flex items-center gap-4 p-4 transition-opacity ${
        done ? "opacity-80" : ""
      }`}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ${
          done ? "bg-brand/15" : "bg-aurora-violet/10"
        }`}
      >
        {task.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${done ? "text-muted" : "text-ink"}`}>
          {task.title}
        </p>
        <p className="text-xs text-faint">{task.description}</p>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#C99A2E]">+{task.rewardCoins} 🪙</span>
          <span className="text-aurora-violet">+{task.rewardXp} ✨</span>
        </div>
      </div>
      <PhotoButton target={{ kind: "task", taskId: task.id }} done={done} onResult={onResult} />
    </div>
  );
}

function QuestCard({
  quest,
  doneSteps,
  onStepResult,
}: {
  quest: Quest;
  doneSteps: string[];
  onStepResult: (step: QuestStep, v: Verdict) => void;
}) {
  const completedCount = quest.steps.filter((s) => doneSteps.includes(s.id)).length;
  const allDone = completedCount === quest.steps.length;
  const pct = Math.round((completedCount / quest.steps.length) * 100);

  return (
    <div className="card-glass overflow-hidden p-6">
      <div className="flex items-start gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
          style={{ background: `${quest.accent}1f` }}
        >
          {quest.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">{quest.title}</h3>
            {allDone && (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Complete
              </span>
            )}
          </div>
          <p className="text-sm text-muted">{quest.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-faint">
          <span>
            {completedCount}/{quest.steps.length} steps
          </span>
          <span>
            Finish bonus: <span className="font-semibold text-[#C99A2E]">+{quest.bonusCoins} 🪙</span>
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full rounded-full"
            style={{ background: quest.accent }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
        </div>
      </div>

      {/* Steps */}
      <ol className="mt-4 space-y-2.5">
        {quest.steps.map((step, i) => {
          const stepDone = doneSteps.includes(step.id);
          // Steps unlock in order — keep the journey feeling like a journey.
          const prevDone = i === 0 || doneSteps.includes(quest.steps[i - 1].id);
          const locked = !stepDone && !prevDone;
          return (
            <li
              key={step.id}
              className={`flex items-center gap-3 rounded-xl border border-hairline/10 bg-surface/60 p-3 ${
                locked ? "opacity-50" : ""
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg ${
                  stepDone ? "bg-brand text-white" : "bg-ink/5"
                }`}
              >
                {stepDone ? <CheckIcon className="h-5 w-5" /> : step.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${stepDone ? "text-muted" : "text-ink"}`}>
                  {step.title}
                </p>
                <p className="text-[11px] font-semibold text-faint">
                  +{step.rewardCoins} 🪙 · +{step.rewardXp} ✨
                </p>
              </div>
              {locked ? (
                <span className="text-xs text-faint">🔒</span>
              ) : (
                <PhotoButton
                  target={{ kind: "step", questId: quest.id, stepId: step.id }}
                  done={stepDone}
                  small
                  onResult={(v) => onStepResult(step, v)}
                />
              )}
            </li>
          );
        })}
      </ol>

      {allDone && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand">
          <SparkIcon className="h-4 w-4" />
          Unlocked: {quest.reward}
        </div>
      )}
    </div>
  );
}

/**
 * Photo-proof button. Opens the camera / file picker, shows an "AI reviewing"
 * state while the server checks the photo with Claude, then reports the verdict
 * to the parent. The image is downscaled, sent for review, and discarded — it is
 * never stored.
 */
function PhotoButton({
  target,
  done,
  small = false,
  onResult,
}: {
  target: ReviewTarget;
  done: boolean;
  small?: boolean;
  onResult: (v: Verdict) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file after a retry
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setReviewing(true);
    const verdict = await reviewPhoto(target, file);
    setReviewing(false);
    setAttempted(true);
    onResult(verdict);
  }

  if (done) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5">
        {preview && (
          // Local blob: preview of the user's photo — next/image can't optimize it.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Your proof"
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-hairline/15"
          />
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-brand/12 px-2.5 py-1 text-xs font-semibold text-brand">
          <CheckIcon className="h-3.5 w-3.5" /> Verified
        </span>
      </span>
    );
  }

  if (reviewing) {
    return (
      <span className="inline-flex shrink-0 items-center gap-2">
        {preview && (
          // Local blob: preview of the user's photo — next/image can't optimize it.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-hairline/15"
          />
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-aurora-violet/12 px-2.5 py-1 text-xs font-semibold text-aurora-violet">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            className="inline-block"
          >
            🤖
          </motion.span>
          AI reviewing…
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      {attempted && preview && (
        // Local blob: preview of the user's photo — next/image can't optimize it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-9 w-9 rounded-lg object-cover opacity-70 ring-1 ring-hairline/15"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onPick}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className={small ? "btn-secondary !px-3 !py-1.5 !text-xs" : "btn-primary"}
      >
        📸 {attempted ? "Try again" : small ? "Upload" : "Upload photo"}
      </button>
    </span>
  );
}
