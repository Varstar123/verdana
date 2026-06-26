import type { Metadata } from "next";
import { getAdminUsers } from "@/lib/admin";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata: Metadata = { title: "Admin · Users" };

export default function AdminUsersPage() {
  const users = getAdminUsers();

  return (
    <div className="container-px space-y-6 py-8">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          User management
        </h1>
        <p className="mt-2 text-muted">
          Search members, change roles, and suspend accounts.
        </p>
      </header>
      <UsersTable initial={users} />
    </div>
  );
}
