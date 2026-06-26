"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/app/Avatar";
import { BellIcon, HeartIcon, UsersIcon, StarIcon, FlameIcon } from "@/components/icons";

type NotifKind = "like" | "follow" | "comment" | "level" | "streak";

interface Notif {
  id: string;
  kind: NotifKind;
  actor: string;
  hue: number;
  text: string;
  time: string;
}

const DEMO: Notif[] = [
  { id: "n1", kind: "like", actor: "Sarah Chen", hue: 180, text: "liked your post about the Amazon Headwaters", time: "5m" },
  { id: "n2", kind: "follow", actor: "Alex Okafor", hue: 90, text: "started following you", time: "22m" },
  { id: "n3", kind: "comment", actor: "Mei Nguyen", hue: 160, text: "commented on your forum thread", time: "1h" },
  { id: "n4", kind: "level", actor: "Verdana", hue: 265, text: "You reached Level 6 — Planet Protector ⭐", time: "3h" },
  { id: "n5", kind: "streak", actor: "Verdana", hue: 28, text: "You're on a 23-day streak — keep it alive!", time: "8h" },
];

const ICON: Record<NotifKind, React.ReactNode> = {
  like: <HeartIcon className="h-3.5 w-3.5" />,
  follow: <UsersIcon className="h-3.5 w-3.5" />,
  comment: <BellIcon className="h-3.5 w-3.5" />,
  level: <StarIcon className="h-3.5 w-3.5" />,
  streak: <FlameIcon className="h-3.5 w-3.5" />,
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(3);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggle() {
    setOpen((o) => {
      if (!o) setUnread(0);
      return !o;
    });
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={toggle}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-hairline/15 bg-surface text-muted transition-colors hover:text-ink"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-aurora-pink px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-hairline/15 bg-elevated shadow-lift">
          <div className="flex items-center justify-between border-b border-hairline/10 px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            <span className="text-xs text-faint">{DEMO.length} recent</span>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {DEMO.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-3 border-b border-hairline/8 px-4 py-3 last:border-0 hover:bg-ink/5"
              >
                <div className="relative">
                  <Avatar name={n.actor} hue={n.hue} size={36} />
                  <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-white ring-2 ring-elevated">
                    {ICON[n.kind]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{n.actor}</span>{" "}
                    <span className="text-muted">{n.text}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-faint">{n.time} ago</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
