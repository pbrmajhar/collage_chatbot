import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/AdminShell";
import { AdminSlotManager } from "@/components/AdminSlotManager";
import { getAdminSettings } from "@/lib/admin-settings";
import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";
import { toAdminSlot } from "@/lib/slots";

export default async function AdminTimeSlotsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const prisma = isDatabaseConfigured() ? getPrisma() : null;
  const slots = prisma
    ? await prisma.availableSlot.findMany({
        orderBy: { startsAt: "asc" },
      })
    : [];
  const settings = await getAdminSettings();

  return (
    <AdminShell
      active="time-slots"
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
        <AdminSlotManager
          initialSlots={slots.map(toAdminSlot)}
          isDatabaseReady={isDatabaseConfigured()}
        />
      </div>
    </AdminShell>
  );
}
