/**
 * Loading skeletons for the app.
 *
 * Each page renders its *static shell* immediately, then streams its
 * database-backed regions inside a <Suspense> boundary whose fallback is one of
 * these skeletons. The same page-level skeletons back the route `loading.tsx`
 * files so a navigation paints instantly instead of hanging on the data fetch.
 *
 * They are plain markup (no client JS). The shimmer comes from the `.skeleton`
 * utility in globals.css. Layouts mirror the real pages so content swaps in
 * without a jump.
 */

/** Base shimmer block. Compose with width/height/rounding utilities. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}

/** Wraps a page skeleton so assistive tech announces the loading state once. */
function Loading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Building blocks                                                            */
/* -------------------------------------------------------------------------- */

function HeaderSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="mt-2 h-9 w-80 max-w-full" />
      <Skeleton className="mt-3 h-4 w-full max-w-md" />
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return <Skeleton className={`rounded-3xl ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="card-glass space-y-3 p-5">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-16 rounded-full" />
    </div>
  );
}

/** A 6-up stat-card grid (dashboard + admin overview). */
export function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

function AvatarRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32 max-w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="card-glass space-y-4 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-[42px] w-[42px] shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex gap-4 border-t border-hairline/10 pt-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

function ThreadCardSkeleton() {
  return (
    <div className="card-glass space-y-3 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="ml-auto h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

/** A vertical activity feed (dashboard, globe, admin). */
export function ActivityFeedSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page-level skeletons                                                       */
/* -------------------------------------------------------------------------- */

export function DashboardSkeleton() {
  return (
    <Loading className="container-px space-y-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <HeaderSkeleton />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <CardSkeleton className="h-72" />
        <CardSkeleton className="h-72" />
      </div>

      <StatGridSkeleton />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <CardSkeleton className="h-80" />
        <CardSkeleton className="h-80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <CardSkeleton className="h-64" />
        <CardSkeleton className="h-64" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-glass p-6">
          <Skeleton className="mb-4 h-5 w-40" />
          <ActivityFeedSkeleton />
        </div>
        <CardSkeleton className="h-64" />
      </div>
    </Loading>
  );
}

/** The streamed region of the community page (everything below the static header). */
export function CommunitySkeleton() {
  return (
    <Loading>
      <div className="mx-auto max-w-2xl">
        <div className="card-glass p-4">
          <Skeleton className="mb-4 h-4 w-40" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-40 shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-5 max-w-2xl space-y-4">
        <CardSkeleton className="h-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </Loading>
  );
}

/** The streamed region of the forums page (category rail + thread list). */
export function ForumsSkeleton() {
  return (
    <Loading>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <CardSkeleton className="mt-5 h-14" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ThreadCardSkeleton key={i} />
        ))}
      </div>
    </Loading>
  );
}

/** The streamed region of the challenges page (streak banner + challenge cards). */
export function ChallengesSkeleton() {
  return (
    <Loading>
      <CardSkeleton className="h-24" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} className="h-40" />
        ))}
      </div>
    </Loading>
  );
}

/** The streamed region of the rewards page (level badge + level ladder). */
export function RewardsSkeleton() {
  return (
    <Loading>
      <Skeleton className="h-11 w-72 max-w-full rounded-2xl" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="card-glass flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-4 sm:w-64 sm:shrink-0">
              <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full sm:shrink-0" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function LeaderboardSkeleton() {
  return (
    <Loading className="container-px space-y-8 py-8">
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card-glass space-y-2 p-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <AvatarRowSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-6">
          <div className="card-glass space-y-2 p-6">
            <Skeleton className="mb-2 h-4 w-32" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
          <CardSkeleton className="h-40" />
        </div>
      </div>
    </Loading>
  );
}

/** The streamed region of "My Earth" (3D earth card + growth-stage ladder). */
export function EarthSkeleton() {
  return (
    <Loading className="container-px grid gap-6 py-8 lg:grid-cols-[1.6fr_1fr]">
      <CardSkeleton className="h-[58vh] min-h-[420px]" />
      <div className="card-glass space-y-3 p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <div className="mt-2 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </Loading>
  );
}

/** The streamed stats rail of the global-earth page. */
export function GlobeStatsSkeleton() {
  return (
    <Loading className="card-glass space-y-4 p-6">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-4 w-40" />
      <ActivityFeedSkeleton rows={5} />
    </Loading>
  );
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export function AdminOverviewSkeleton() {
  return (
    <Loading className="container-px space-y-8 py-8">
      <HeaderSkeleton />
      <StatGridSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <CardSkeleton className="h-72" />
        <CardSkeleton className="h-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <CardSkeleton className="h-64" />
        <div className="card-glass p-6">
          <Skeleton className="mb-4 h-4 w-40" />
          <ActivityFeedSkeleton />
        </div>
      </div>
    </Loading>
  );
}

/** Generic admin page skeleton: header + a list of table rows. */
export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Loading className="container-px space-y-6 py-8">
      <HeaderSkeleton />
      <div className="card-glass divide-y divide-hairline/10 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <AvatarRowSkeleton key={i} />
        ))}
      </div>
    </Loading>
  );
}

/** Generic admin page skeleton: header + stacked content cards. */
export function AdminListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Loading className="container-px space-y-6 py-8">
      <HeaderSkeleton />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <CardSkeleton key={i} className="h-28" />
        ))}
      </div>
    </Loading>
  );
}

export function ProfileSkeleton() {
  return (
    <Loading className="pb-10">
      <Skeleton className="h-44 w-full rounded-none sm:h-56" />
      <div className="container-px">
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Skeleton className="h-[104px] w-[104px] rounded-full ring-4 ring-canvas" />
            <div className="space-y-2 pb-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-full" />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <CardSkeleton className="h-80" />
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} className="h-24" />
              ))}
            </div>
            <CardSkeleton className="h-48" />
            <CardSkeleton className="h-44" />
          </div>
        </div>
      </div>
    </Loading>
  );
}
