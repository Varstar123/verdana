import { ForumsSkeleton } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div className="container-px py-8">
      <header className="mb-6">
        <p className="eyebrow">Eco Forums</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Discuss, debate, share what works
        </h1>
        <p className="mt-2 text-muted">
          Ask questions, swap tactics, and upvote the best ideas across the
          community.
        </p>
      </header>

      <ForumsSkeleton />
    </div>
  );
}
