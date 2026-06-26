import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isClerkConfigured } from "@/lib/env";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { MobileNav } from "@/components/app/MobileNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // With Clerk configured, require a real session. In demo mode, browse freely.
  if (isClerkConfigured && !session.authenticated) {
    redirect("/login");
  }

  const { profile, demo, isAdmin } = session;

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="aurora-bg opacity-40" />
      <Sidebar planetId={profile.planetId} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          displayName={profile.displayName}
          hue={profile.avatarHue}
          planetId={profile.planetId}
          isAdmin={isAdmin}
          showUserButton={!demo}
        />

        {demo && (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-hairline/10 bg-aurora-violet/10 px-4 py-2 text-center text-xs text-muted">
            <span className="font-medium text-ink">Demo mode</span>
            <span>
              — exploring with seeded data. Add Clerk keys to enable Google sign-in.
            </span>
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </div>
        )}

        <div className="flex-1 pb-24 lg:pb-0">{children}</div>
      </div>

      <MobileNav planetId={profile.planetId} />
    </div>
  );
}
