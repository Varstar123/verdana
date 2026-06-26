"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ActivityItem } from "@/lib/types";
import { Avatar } from "@/components/app/Avatar";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((it, i) => (
        <motion.li
          key={it.id}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <Link
            href={`/profile/${it.actorPlanetId}`}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-ink/5"
          >
            <Avatar name={it.actorName} hue={it.actorHue} size={36} />
            <p className="min-w-0 flex-1 text-sm text-muted">
              <span className="font-semibold text-ink">{it.actorName}</span>{" "}
              {it.detail}
            </p>
            <span className="shrink-0 text-xs text-faint">{it.createdAt}</span>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
