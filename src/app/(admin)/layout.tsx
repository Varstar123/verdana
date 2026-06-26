import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar } from "@/components/app/Avatar";
import { ShieldCheckIcon } from "@/components/icons";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, profile, demo } = await getSession();

  // Admins only. Non-admins are sent back to the app.
  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-canvas">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-hairline/10 bg-canvas/70 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <ShieldCheckIcon className="h-5 w-5 text-aurora-violet" />
            <span className="font-display font-semibold text-ink">Admin</span>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-aurora-violet/12 px-3 py-1 text-xs font-semibold text-aurora-violet">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Admin access
          </span>
          <ThemeToggle />
          <Link href={`/profile/${profile.planetId}`}>
            <Avatar name={profile.displayName} hue={profile.avatarHue} size={34} />
          </Link>
        </header>

        {demo && (
          <div className="border-b border-hairline/10 bg-aurora-violet/10 px-4 py-2 text-center text-xs text-muted">
            <span className="font-medium text-ink">Demo mode</span> — admin is open
            for exploration. With Clerk configured, only users with the{" "}
            <code className="text-ink">admin</code> role can enter.
          </div>
        )}

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
