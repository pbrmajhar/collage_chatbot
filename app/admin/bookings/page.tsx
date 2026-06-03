import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminBookingManager } from "@/components/AdminBookingManager";
import { AdminShell } from "@/components/AdminShell";
import { getAdminSettings } from "@/lib/admin-settings";
import { toAdminBooking, withBookingReadStatuses } from "@/lib/bookings";
import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";
import { toAdminSlot } from "@/lib/slots";

export default async function AdminBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const prisma = isDatabaseConfigured() ? getPrisma() : null;

  const [bookingsWithoutReadStatus, slots, settings] = await Promise.all([
    prisma
      ? prisma.booking.findMany({
          include: {
            slot: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : [],
    prisma
      ? prisma.availableSlot.findMany({
          orderBy: {
            startsAt: "asc",
          },
        })
      : [],
    getAdminSettings(),
  ]);
  const bookings = prisma
    ? await withBookingReadStatuses(prisma, bookingsWithoutReadStatus)
    : bookingsWithoutReadStatus;

  return (
    <AdminShell
      active="bookings"
      title={settings.title}
      description={settings.subtitle}
    >
      {!isDatabaseConfigured() && (
        <section className="shrink-0 border-b border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-100 sm:px-7">
          Set a real PostgreSQL `DATABASE_URL` in `.env` and `.env.local`,
          then run `npm run prisma:migrate`.
        </section>
      )}

      <AdminBookingManager
        initialBookings={bookings.map(toAdminBooking)}
        initialSlots={slots.map(toAdminSlot)}
        isDatabaseReady={isDatabaseConfigured()}
      />
    </AdminShell>
  );
}
