import { SlotStatus, type AvailableSlot } from "@prisma/client";

export type AdminSlotBooking = {
  id: string;
  studentEmail: string;
  studentName: string;
  studentPhone: string;
};

export type AdminSlot = {
  bookings: AdminSlotBooking[];
  id: string;
  date: string;
  fromTime: string;
  isPast: boolean;
  toTime: string;
  timeRange: string;
  topic: string;
  status: "open" | "booked" | "closed";
};

type SlotBooking = {
  id: string;
  studentEmail: string;
  studentName: string;
  studentPhone: string | null;
};

type SlotWithBookings = AvailableSlot & {
  bookings?: SlotBooking[];
};

function formatTokyoDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).formatToParts(date);
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

export function toAdminSlot(slot: SlotWithBookings): AdminSlot {
  const startsAt = new Date(slot.startsAt);
  const endsAt = slot.endsAt
    ? new Date(slot.endsAt)
    : new Date(startsAt.getTime() + 30 * 60 * 1000);
  const start = formatTokyoDateTime(startsAt);
  const end = formatTokyoDateTime(endsAt);

  return {
    bookings: (slot.bookings ?? []).map((booking) => ({
      id: booking.id,
      studentEmail: booking.studentEmail,
      studentName: booking.studentName,
      studentPhone: booking.studentPhone ?? "",
    })),
    id: slot.id,
    date: start.date,
    fromTime: start.time,
    isPast: endsAt < new Date(),
    toTime: end.time,
    timeRange: `${start.time}-${end.time}`,
    topic: slot.topic,
    status: slot.status.toLowerCase() as AdminSlot["status"],
  };
}

export function toSlotStatus(status: string) {
  if (status === "booked") {
    return SlotStatus.BOOKED;
  }

  if (status === "closed") {
    return SlotStatus.CLOSED;
  }

  return SlotStatus.OPEN;
}

export function createSlotStart(date: string, time: string) {
  return new Date(`${date}T${time}:00+09:00`);
}

export function createSlotEnd(date: string, time: string) {
  return new Date(`${date}T${time}:00+09:00`);
}
