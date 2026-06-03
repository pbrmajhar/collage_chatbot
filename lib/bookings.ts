import {
  BookingStatus,
  type AvailableSlot,
  type Booking,
  type PrismaClient,
} from "@prisma/client";
import { toAdminSlot, type AdminSlot } from "@/lib/slots";

export type AdminBooking = {
  id: string;
  comment: string;
  createdAt: string;
  isRead: boolean;
  language: string;
  slot: AdminSlot;
  slotId: string;
  status: "pending" | "confirmed" | "cancelled";
  studentEmail: string;
  studentName: string;
  studentPhone: string;
  updatedAt: string;
};

type BookingWithSlot = Booking & {
  isRead?: boolean;
  slot: AvailableSlot;
};

export function toAdminBooking(booking: BookingWithSlot): AdminBooking {
  return {
    id: booking.id,
    comment: booking.comment,
    createdAt: booking.createdAt.toISOString(),
    isRead: booking.isRead ?? false,
    language: booking.language,
    slot: toAdminSlot(booking.slot),
    slotId: booking.slotId,
    status: booking.status.toLowerCase() as AdminBooking["status"],
    studentEmail: booking.studentEmail,
    studentName: booking.studentName,
    studentPhone: booking.studentPhone ?? "",
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export async function withBookingReadStatuses<T extends { id: string }>(
  prisma: PrismaClient,
  bookings: T[],
) {
  if (bookings.length === 0) {
    return bookings;
  }

  const rows = await prisma.$queryRaw<Array<{ id: string; isRead: boolean }>>`
    SELECT "id", "isRead"
    FROM "Booking"
  `;
  const readStatusById = new Map(
    rows.map((row) => [row.id, row.isRead]),
  );

  return bookings.map((booking) => ({
    ...booking,
    isRead: readStatusById.get(booking.id) ?? false,
  }));
}

export function toBookingStatus(status: string) {
  if (status === "pending") {
    return BookingStatus.PENDING;
  }

  if (status === "cancelled") {
    return BookingStatus.CANCELLED;
  }

  return BookingStatus.CONFIRMED;
}
