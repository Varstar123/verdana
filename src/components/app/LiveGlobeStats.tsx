"use client";

import { useEffect, useState } from "react";
import type { ActivityItem, GlobalStats } from "@/lib/types";
import { formatCompact } from "@/lib/scoring";
import { TreeIcon, LeafIcon, RecycleIcon, GlobeIcon, UsersIcon, BoltIcon } from "@/components/icons";

const NAMES = ["Sarah", "Alex", "Mei", "Diego", "Priya", "Noah", "Amara", "Kofi", "Lena", "Ravi"];
const EVENTS = [
  (n: string) => `🌱 ${n} planted ${2 + Math.floor(Math.random() * 6)} trees`,
  (n: string) => `♻️ ${n} recycled ${3 + Math.floor(Math.random() * 14)}kg of plastic`,
  (n: string) => `🌊 ${n} joined an ocean cleanup`,
  (n: string) => `⭐ ${n} leveled up`,
  (n: string) => `🏆 ${n} unlocked a new badge`,
  (n: string) => `🚲 ${n} biked instead of driving`,
];

export function LiveGlobeStats({
  initial,
  activity,
}: {
  initial: GlobalStats;
  activity: ActivityItem[];
}) {
  const [stats, setStats] = useState(initial);
  const [ticker, setTicker] = useState<{ id: string; hue: number; text: string }[]>(
    activity.slice(0, 6).map((a, i) => ({
      id: `init-${i}`,
      hue: a.actorHue,
      text: `${a.actorName} ${a.detail}`,
    })),
  );

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setStats((s) => ({
        ...s,
        trees: s.trees + 1 + Math.floor(Math.random() * 9),
        co2Tonnes: s.co2Tonnes + Math.floor(Math.random() * 4),
        plasticTonnes: s.plasticTonnes + (Math.random() < 0.5 ? 1 : 0),
        online: Math.max(
          2800,
          s.online + Math.floor(Math.random() * 60) - 28,
        ),
      }));
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const text = EVENTS[Math.floor(Math.random() * EVENTS.length)](name);
      setTicker((t) =>
        [{ id: `t-${n}-${Math.floor(Math.random() * 1e6)}`, hue: Math.floor(Math.random() * 360), text }, ...t].slice(0, 8),
      );
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const cards = [
    { label: "Trees planted", value: stats.trees, icon: <TreeIcon className="h-5 w-5" />, accent: "#22A155" },
    { label: "CO₂ offset (t)", value: stats.co2Tonnes, icon: <LeafIcon className="h-5 w-5" />, accent: "#2DD4BF" },
    { label: "Plastic (t)", value: stats.plasticTonnes, icon: <RecycleIcon className="h-5 w-5" />, accent: "#22D3EE" },
    { label: "Countries", value: stats.countries, icon: <GlobeIcon className="h-5 w-5" />, accent: "#8B5CF6" },
    { label: "Citizens", value: stats.users, icon: <UsersIcon className="h-5 w-5" />, accent: "#EC4899" },
    { label: "Online now", value: stats.online, icon: <BoltIcon className="h-5 w-5" />, accent: "#FB923C", live: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card-glass p-4">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg text-white"
              style={{ background: c.accent }}
            >
              {c.icon}
            </span>
            <p className="mt-3 font-display text-xl font-semibold text-ink">
              {formatCompact(c.value)}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-faint">
              {c.live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22A155]" />}
              {c.label}
            </p>
          </div>
        ))}
      </div>

      <div className="card-glass p-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Live contributions</p>
          <span className="flex items-center gap-1.5 text-xs text-faint">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#22A155]" />
            live
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {ticker.map((item) => (
            <li
              key={item.id}
              className="flex animate-fade-up items-center gap-2.5 text-sm text-muted"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: `hsl(${item.hue} 70% 55%)` }}
              />
              <span className="truncate">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
