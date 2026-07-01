import type { Metadata } from "next";
import { getWriterId } from "@/lib/auth";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { readWallet } from "@/lib/quest-wallet";
import { QuestBoard } from "@/components/app/QuestBoard";
import { DAILY_TASKS, QUESTS, emptyWallet } from "@/lib/quests";

export const metadata: Metadata = { title: "Quests" };

export default async function QuestsPage() {
  const uid = await getWriterId();
  const persisted = isFirebaseAdminConfigured && !!uid;
  const initialWallet = persisted && uid ? await readWallet(uid) : emptyWallet();

  return (
    <div className="container-px py-8">
      <header className="mb-6">
        <p className="eyebrow">Quests &amp; tasks</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Do good at home, grow real forests 🌱
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Snap a photo of your everyday green actions — water a plant, recycle, plant a
          sapling — to earn Green Coins. Bank enough and we&apos;ll plant a real tree in your
          name.
        </p>
      </header>

      <QuestBoard
        tasks={DAILY_TASKS}
        quests={QUESTS}
        initialWallet={initialWallet}
        persisted={persisted}
      />
    </div>
  );
}
