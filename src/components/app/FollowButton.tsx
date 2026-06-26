"use client";

import { useState } from "react";
import { PlusIcon, CheckIcon } from "@/components/icons";

export function FollowButton({ name }: { name: string }) {
  const [following, setFollowing] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFollowing((f) => !f)}
      className={following ? "btn-secondary" : "btn-primary"}
      aria-pressed={following}
    >
      {following ? (
        <>
          <CheckIcon className="h-4 w-4" /> Following
        </>
      ) : (
        <>
          <PlusIcon className="h-4 w-4" /> Follow {name.split(" ")[0]}
        </>
      )}
    </button>
  );
}
