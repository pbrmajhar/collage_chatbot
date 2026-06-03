import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/AdminShell";
import { AdminUserManager } from "@/components/AdminUserManager";
import { getAdminSettings } from "@/lib/admin-settings";
import { listAdminUsers } from "@/lib/admin-users";
import { isDatabaseConfigured } from "@/lib/database";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const settings = await getAdminSettings();
  const users = await listAdminUsers();

  return (
    <AdminShell
      active="users"
      title={settings.title}
      description={settings.subtitle}
    >
      {!isDatabaseConfigured() && (
        <section className="shrink-0 border-b border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-100 sm:px-7">
          PostgreSQLの DATABASE_URL を設定してから、Prismaマイグレーションを実行してください。
        </section>
      )}

      <AdminUserManager
        currentAdminEmail={session.user.email}
        initialUsers={users}
        isDatabaseReady={isDatabaseConfigured()}
      />
    </AdminShell>
  );
}
