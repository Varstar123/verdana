import type { Metadata } from "next";
import { MODERATION_REPORTS } from "@/lib/admin";
import { ModerationQueue } from "@/components/admin/ModerationQueue";

export const metadata: Metadata = { title: "Admin · Moderation" };

export default function AdminContentPage() {
  return (
    <div className="container-px space-y-6 py-8">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Content moderation
        </h1>
        <p className="mt-2 text-muted">
          Review reported posts and forum content from the community.
        </p>
      </header>
      <ModerationQueue initial={MODERATION_REPORTS} />
    </div>
  );
}
