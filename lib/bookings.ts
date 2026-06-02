import {
  BookingStatus,
  type AvailableSlot,
  type Booking,
} from "@prisma/client";
import { toAdminSlot, type AdminSlot } from "@/lib/slots";

export type AdminBooking = {
  id: string;
  comment: string;
  createdAt: string;
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
  slot: AvailableSlot;
};

export function toAdminBooking(booking: BookingWithSlot): AdminBooking {
  return {
    id: booking.id,
    comment: booking.comment,
    createdAt: booking.createdAt.toISOString(),
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

export function toBookingStatus(status: string) {
  if (status === "pending") {
    return BookingStatus.PENDING;
  }

  if (status === "cancelled") {
    return BookingStatus.CANCELLED;
  }

  return BookingStatus.CONFIRMED;
}
