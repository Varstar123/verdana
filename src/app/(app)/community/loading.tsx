import { isFirebaseAdminConfigured } from "@/lib/env";
import { CommunitySkeleton } from "@/components/app/Skeletons";

export default function Loading() {
  const persisted = isFirebaseAdminConfigured;

  return (
    <div className="container-px py-8">
      <header className="mx-auto mb-6 max-w-2xl">
        <p className="eyebrow">Community</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          The feed
        </h1>
        <p className="mt-2 text-muted">
          Share your wins, swap ideas, and cheer each other on.
          {!persisted && (
            <span className="text-faint">
              {" "}
              (Demo: your posts are saved in this browser. Add Firebase keys to make
              them global.)
            </span>
          )}
        </p>
      </header>

      <CommunitySkeleton />
    </div>
  );
}
