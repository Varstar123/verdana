"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COINS_PER_REAL_TREE } from "@/lib/quests";
import { ArrowRightIcon } from "@/components/icons";

/**
 * Compact dashboard banner for the Quests economy. When the wallet is persisted
 * server-side, the balance is passed in as props (rendered on the server, so
 * it's correct immediately). In demo mode it falls back to reading the same
 * localStorage wallet the Quests page writes.
 */
export function QuestsTeaser({
  persisted = false,
  coins: coinsProp = 0,
  treesFunded: treesProp = 0,
}: {
  persisted?: boolean;
  coins?: number;
  treesFunded?: number;
}) {
  // Persisted values are known at render time; demo values load after mount.
  const [mounted, setMounted] = useState(persisted);
  const [coins, setCoins] = useState(coinsProp);
  const [treesFunded, setTreesFunded] = useState(treesProp);

  useEffect(() => {
    if (persisted) return; // server-provided — nothing to read
    setMounted(true);
    try {
      const raw = localStorage.getItem("verdana_quests_v1");
      if (raw) {
        const w = JSON.parse(raw) as { coins?: number; treesFunded?: number };
        setCoins(w.coins ?? 0);
        setTreesFunded(w.treesFunded ?? 0);
      }
    } catch {
      /* ignore */
    }
  }, [persisted]);

  const towardNext = coins % COINS_PER_REAL_TREE;
  const pct = Math.round((towardNext / COINS_PER_REAL_TREE) * 100);
  const coinsToNext = COINS_PER_REAL_TREE - towardNext;
  const canRedeem = mounted && coins >= COINS_PER_REAL_TREE;

  return (
    <Link
      href="/quests"
      className="card-glass group relative flex flex-col gap-4 overflow-hidden p-5 transition-shadow hover:shadow-lift sm:flex-row sm:items-center"
    >
      <div className="aurora-bg opacity-40" />
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/12 text-2xl">
        🌱
      </span>

      <div className="min-w-0 flex-1">
        <p className="eyebrow">Quests · Green Wallet</p>
        <p className="mt-0.5 font-display text-lg font-semibold text-ink">
          {!mounted ? (
            "Snap photos, earn coins, plant real trees"
          ) : canRedeem ? (
            <>You have enough coins to plant a real tree! 🎉</>
          ) : (
            <>
              <span className="text-brand">{coins.toLocaleString()} 🪙</span> — {coinsToNext}{" "}
              coins to your next real tree
            </>
          )}
        </p>
        <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-brand-gradient transition-[width] duration-500"
            style={{ width: `${mounted ? (canRedeem ? 100 : pct) : 0}%` }}
          />
        </div>
        {mounted && treesFunded > 0 && (
          <p className="mt-1.5 text-xs text-faint">
            🌳 You&apos;ve funded {treesFunded} real {treesFunded === 1 ? "tree" : "trees"} so far —
            thank you!
          </p>
        )}
      </div>

      <span className="btn-primary shrink-0">
        Open Quests
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
