"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/app/CountUp";
import { ICONS, type IconKey, type FormatKey } from "@/components/app/registry";

export function StatCard({
  label,
  value,
  unit,
  iconKey,
  accent = "#22A155",
  formatKey,
  index = 0,
}: {
  label: string;
  value: number;
  unit?: string;
  iconKey: IconKey;
  accent?: string;
  formatKey?: FormatKey;
  index?: number;
}) {
  const Icon = ICONS[iconKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="card-glass group relative overflow-hidden p-5"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
        style={{ background: accent }}
      />
      <div
        className="grid h-10 w-10 place-items-center rounded-xl text-white"
        style={{ background: accent }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 stat-value">
        <CountUp value={value} formatKey={formatKey} />
        {unit && <span className="ml-1 text-base font-medium text-faint">{unit}</span>}
      </div>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </motion.div>
  );
}
