"use client";

import { useEffect, useState, useTransition } from "react";
import { PlusIcon, CheckIcon } from "@/components/icons";
import { followAction, unfollowAction } from "@/app/(app)/social-actions";

const LS_KEY = "verdana_following";

function readLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function FollowButton({
  targetPlanetId,
  targetName,
  persisted = false,
  initialFollowing = false,
}: {
  targetPlanetId: string;
  targetName: string;
  persisted?: boolean;
  initialFollowing?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [, startTransition] = useTransition();

  // Demo mode: hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    if (!persisted) setFollowing(readLocal().includes(targetPlanetId));
  }, [persisted, targetPlanetId]);

  function toggle() {
    const next = !following;
    setFollowing(next);

    if (persisted) {
      startTransition(() => {
        void (next ? followAction(targetPlanetId) : unfollowAction(targetPlanetId));
      });
    } else {
      const set = new Set(readLocal());
      if (next) set.add(targetPlanetId);
      else set.delete(targetPlanetId);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...set]));
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={following ? "btn-secondary" : "btn-primary"}
      aria-pressed={following}
    >
      {following ? (
        <>
          <CheckIcon className="h-4 w-4" /> Following
        </>
      ) : (
        <>
          <PlusIcon className="h-4 w-4" /> Follow {targetName.split(" ")[0]}
        </>
      )}
    </button>
  );
}
