import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSettingsForm } from "@/components/AdminSettingsForm";
import { AdminShell } from "@/components/AdminShell";
import { getAdminSettings } from "@/lib/admin-settings";
import { isDatabaseConfigured } from "@/lib/database";

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const settings = await getAdminSettings();

  return (
    <AdminShell
      active="settings"
      title={settings.title}
      description={settings.subtitle}
    >
      {!isDatabaseConfigured() && (
        <section className="shrink-0 border-b border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-100 sm:px-7">
          Set a real PostgreSQL `DATABASE_URL` in `.env` and `.env.local`,
          then run `npm run prisma:migrate`.
        </section>
      )}

      <AdminSettingsForm
        initialSettings={settings}
        isDatabaseReady={isDatabaseConfigured()}
      />
    </AdminShell>
  );
}
