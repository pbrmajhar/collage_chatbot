import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

export async function getUnreadBookingCount() {
  if (!isDatabaseConfigured()) {
    return 0;
  }

  try {
    const prisma = getPrisma();

    if (!prisma.booking) {
      return 0;
    }

    const rows = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "Booking"
      WHERE "isRead" = false
    `;

    return Number(rows[0]?.count ?? 0);
  } catch (error) {
    console.error("Unread booking count error:", error);
    return 0;
  }
}

export async function markBookingsAsRead() {
  if (!isDatabaseConfigured()) {
    return;
  }

  try {
    const prisma = getPrisma();

    if (!prisma.booking) {
      return;
    }

    await prisma.$executeRaw`
      UPDATE "Booking"
      SET "isRead" = true
      WHERE "isRead" = false
    `;
  } catch (error) {
    console.error("Mark bookings as read error:", error);
  }
}
