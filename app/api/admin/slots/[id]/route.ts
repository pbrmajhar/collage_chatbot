import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import {
  createSlotEnd,
  createSlotStart,
  toAdminSlot,
  toSlotStatus,
} from "@/lib/slots";

type UpdateSlotBody = {
  date?: unknown;
  fromTime?: unknown;
  status?: unknown;
  topic?: unknown;
  toTime?: unknown;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as UpdateSlotBody;
  const date = typeof body.date === "string" ? body.date : "";
  const fromTime = typeof body.fromTime === "string" ? body.fromTime : "";
  const status = typeof body.status === "string" ? body.status : "open";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const toTime = typeof body.toTime === "string" ? body.toTime : "";

  if (!date || !fromTime || !toTime || !topic) {
    return NextResponse.json(
      { error: "Date, from time, to time, and topic are required." },
      { status: 400 },
    );
  }

  const startsAt = createSlotStart(date, fromTime);
  const endsAt = createSlotEnd(date, toTime);

  if (endsAt <= startsAt) {
    return NextResponse.json(
      { error: "To time must be later than from time." },
      { status: 400 },
    );
  }

  const prisma = getPrisma();

  const slot = await prisma.availableSlot.update({
    where: { id },
    data: {
      endsAt,
      startsAt,
      status: toSlotStatus(status),
      topic,
    },
    include: {
      bookings: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          studentEmail: true,
          studentName: true,
          studentPhone: true,
        },
      },
    },
  });

  return NextResponse.json({ slot: toAdminSlot(slot) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const prisma = getPrisma();
  const bookingCount = await prisma.booking.count({
    where: {
      slotId: id,
    },
  });

  if (bookingCount > 0) {
    return NextResponse.json(
      { error: "This slot has bookings. Delete or move the bookings first." },
      { status: 409 },
    );
  }

  await prisma.availableSlot.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({ ok: true });
}
