"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { searchProfiles } from "@/lib/community";
import { Avatar } from "@/components/app/Avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SearchIcon, BellIcon, ShieldCheckIcon } from "@/components/icons";

export function Topbar({
  displayName,
  hue,
  planetId,
  isAdmin = false,
  showUserButton = false,
}: {
  displayName: string;
  hue: number;
  planetId: string;
  isAdmin?: boolean;
  showUserButton?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = query ? searchProfiles(query) : [];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(pid: string) {
    setOpen(false);
    setQuery("");
    router.push(`/profile/${pid}`);
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-hairline/10 bg-canvas/70 px-4 backdrop-blur-md sm:px-6">
      {/* Planet ID / user search */}
      <div ref={boxRef} className="relative w-full max-w-md">
        <div className="flex items-center gap-2 rounded-full border border-hairline/15 bg-surface px-4 py-2">
          <SearchIcon className="h-4 w-4 text-faint" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].planetId);
            }}
            placeholder="Search a Planet ID or name…  (e.g. VER-582931)"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
        </div>

        {open && query && (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-hairline/15 bg-elevated shadow-lift">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-faint">No citizens found.</p>
            ) : (
              results.map((p) => (
                <button
                  key={p.planetId}
                  onClick={() => go(p.planetId)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-ink/5"
                >
                  <Avatar name={p.displayName} hue={p.avatarHue} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {p.displayName}
                    </span>
                    <span className="block truncate font-mono text-xs text-faint">
                      {p.planetId}
                    </span>
                  </span>
                  <span className="text-xs text-faint">{p.country}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="hidden items-center gap-1.5 rounded-full border border-hairline/15 bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink sm:inline-flex"
          >
            <ShieldCheckIcon className="h-4 w-4" />
            Admin
          </Link>
        )}
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-full border border-hairline/15 bg-surface text-muted transition-colors hover:text-ink"
        >
          <BellIcon className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-aurora-pink" />
        </button>
        <ThemeToggle />
        {showUserButton ? (
          <div className="ml-1 grid h-9 w-9 place-items-center">
            <UserButton />
          </div>
        ) : (
          <Link href={`/profile/${planetId}`} className="ml-1">
            <Avatar name={displayName} hue={hue} size={36} />
          </Link>
        )}
      </div>
    </header>
  );
}
