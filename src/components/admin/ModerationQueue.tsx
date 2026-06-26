"use client";

import { useState } from "react";
import type { ModerationReport } from "@/lib/admin";
import { Avatar } from "@/components/app/Avatar";
import { CheckIcon, LockIcon } from "@/components/icons";

type Decision = "kept" | "removed";

export function ModerationQueue({ initial }: { initial: ModerationReport[] }) {
  const [reports, setReports] = useState(initial);
  const [decided, setDecided] = useState<Record<string, Decision>>({});

  const open = reports.filter((r) => r.status === "open" && !decided[r.id]);

  function decide(id: string, decision: Decision) {
    setDecided((d) => ({ ...d, [id]: decision }));
  }

  return (
    <div className="space-y-4">
      {open.length === 0 ? (
        <div className="card-glass p-10 text-center">
          <CheckIcon className="mx-auto h-8 w-8 text-[#22A155]" />
          <p className="mt-3 font-medium text-ink">Queue clear</p>
          <p className="text-sm text-faint">No reports awaiting review. Nice work.</p>
        </div>
      ) : (
        open.map((r) => (
          <div key={r.id} className="card-glass p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Avatar name={r.author} hue={r.authorHue} size={32} />
              <span className="text-sm font-medium text-ink">@{r.author}</span>
              <span className="rounded-full bg-aurora-pink/12 px-2.5 py-0.5 text-xs font-medium text-aurora-pink">
                {r.reason}
              </span>
              <span className="text-xs text-faint">· {r.reports} reports · {r.when} ago</span>
            </div>

            <blockquote className="mt-3 rounded-xl border border-hairline/10 bg-ink/5 p-3 text-sm text-muted">
              “{r.excerpt}”
            </blockquote>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => decide(r.id, "removed")}
                className="btn-primary !bg-aurora-pink"
              >
                <LockIcon className="h-4 w-4" />
                Remove content
              </button>
              <button onClick={() => decide(r.id, "kept")} className="btn-secondary">
                <CheckIcon className="h-4 w-4" />
                Dismiss report
              </button>
            </div>
          </div>
        ))
      )}

      {Object.keys(decided).length > 0 && (
        <div className="card-glass p-5">
          <p className="eyebrow">Resolved this session</p>
          <ul className="mt-3 space-y-2 text-sm">
            {reports
              .filter((r) => decided[r.id])
              .map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-muted">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      decided[r.id] === "removed"
                        ? "bg-aurora-pink/12 text-aurora-pink"
                        : "bg-[#22A155]/12 text-[#22A155]"
                    }`}
                  >
                    {decided[r.id] === "removed" ? "Removed" : "Dismissed"}
                  </span>
                  <span className="truncate">@{r.author} — {r.reason}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
