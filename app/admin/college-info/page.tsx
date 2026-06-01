import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/AdminShell";
import { CollegeInfoManager } from "@/components/CollegeInfoManager";
import { getAdminSettings } from "@/lib/admin-settings";
import { toAdminCollegeInfo } from "@/lib/college-info";
import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

export default async function AdminCollegeInfoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const prisma = isDatabaseConfigured() ? getPrisma() : null;
  const collegeInfoItems = prisma?.collegeInfo
    ? await prisma.collegeInfo.findMany({
        orderBy: [{ language: "asc" }, { sortOrder: "asc" }],
      })
    : [];
  const settings = await getAdminSettings();

  return (
    <AdminShell
      active="college-info"
      title={settings.title}
      description={settings.subtitle}
    >
      {!isDatabaseConfigured() && (
        <section className="shrink-0 border-b border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-100 sm:px-7">
          Set a real PostgreSQL `DATABASE_URL` in `.env` and `.env.local`,
          then run `npm run prisma:migrate`.
        </section>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <CollegeInfoManager
          initialItems={collegeInfoItems.map(toAdminCollegeInfo)}
          isDatabaseReady={isDatabaseConfigured()}
        />
      </div>
    </AdminShell>
  );
}
