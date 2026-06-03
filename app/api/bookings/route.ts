import { BookingStatus, SlotStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";
import { toAdminSlot } from "@/lib/slots";

type CreateBookingBody = {
  language?: unknown;
  slotId?: unknown;
  studentEmail?: unknown;
  studentName?: unknown;
  studentPhone?: unknown;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isKnownUniqueConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as CreateBookingBody;
  const slotId = getString(body.slotId);
  const studentName = getString(body.studentName);
  const studentEmail = getString(body.studentEmail);
  const studentPhone = getString(body.studentPhone);
  const language = getString(body.language) || "ja";

  if (!slotId || !studentName || !studentEmail || !studentPhone) {
    return NextResponse.json(
      { error: "Slot, name, email, and phone are required." },
      { status: 400 },
    );
  }

  const prisma = getPrisma();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.availableSlot.findFirst({
        where: {
          id: slotId,
          status: SlotStatus.OPEN,
          startsAt: {
            gte: new Date(),
          },
        },
      });

      if (!slot) {
        throw new Error("Slot is no longer available.");
      }

      const existingPhoneBooking = await tx.booking.findFirst({
        where: {
          studentPhone,
        },
      });

      if (existingPhoneBooking) {
        throw new Error("This phone number already has a booking.");
      }

      const booking = await tx.booking.create({
        data: {
          language,
          slotId,
          status: BookingStatus.CONFIRMED,
          studentEmail,
          studentName,
          studentPhone,
        },
      });
      await tx.$executeRaw`
        UPDATE "Booking"
        SET "isRead" = false
        WHERE "id" = ${booking.id}
      `;

      return {
        booking,
        slot,
      };
    });

    return NextResponse.json(
      {
        booking: result.booking,
        slot: toAdminSlot(result.slot),
      },
      { status: 201 },
    );
  } catch (error) {
    const message = isKnownUniqueConflict(error)
      ? "This phone number already has a booking."
      : error instanceof Error
        ? error.message
        : "Could not create booking.";

    return NextResponse.json({ error: message }, { status: 409 });
  }
}
