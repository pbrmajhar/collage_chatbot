import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toAdminBooking, toBookingStatus } from "@/lib/bookings";
import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

type UpdateBookingBody = {
  comment?: unknown;
  isRead?: unknown;
  language?: unknown;
  slotId?: unknown;
  status?: unknown;
  studentEmail?: unknown;
  studentName?: unknown;
  studentPhone?: unknown;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
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

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const body = (await request.json()) as UpdateBookingBody;
  const slotId = getString(body.slotId);
  const studentName = getString(body.studentName);
  const studentEmail = getString(body.studentEmail);
  const studentPhone = getString(body.studentPhone);
  const comment = getString(body.comment);
  const isRead = typeof body.isRead === "boolean" ? body.isRead : false;
  const language = getString(body.language) || "ja";
  const status = getString(body.status) || "confirmed";

  if (!slotId || !studentName || !studentEmail || !studentPhone) {
    return NextResponse.json(
      { error: "Slot, name, email, and phone are required." },
      { status: 400 },
    );
  }

  const prisma = getPrisma();

  try {
    const booking = await prisma.booking.update({
      data: {
        comment,
        language,
        slotId,
        status: toBookingStatus(status),
        studentEmail,
        studentName,
        studentPhone,
      },
      include: {
        slot: true,
      },
      where: {
        id,
      },
    });
    await prisma.$executeRaw`
      UPDATE "Booking"
      SET "isRead" = ${isRead}
      WHERE "id" = ${id}
    `;

    return NextResponse.json({
      booking: toAdminBooking({
        ...booking,
        isRead,
      }),
    });
  } catch (error) {
    const message = isKnownUniqueConflict(error)
      ? "This phone number already has a booking."
      : error instanceof Error
        ? error.message
        : "Could not update booking.";

    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const prisma = getPrisma();

  await prisma.booking.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({ ok: true });
}
