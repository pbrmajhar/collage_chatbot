import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { createSlotEnd, createSlotStart, toAdminSlot } from "@/lib/slots";

type CreateSlotBody = {
  date?: unknown;
  fromTime?: unknown;
  topic?: unknown;
  toTime?: unknown;
};

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  const slots = await prisma.availableSlot.findMany({
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
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json({
    slots: slots.map(toAdminSlot),
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateSlotBody;
  const date = typeof body.date === "string" ? body.date : "";
  const fromTime = typeof body.fromTime === "string" ? body.fromTime : "";
  const toTime = typeof body.toTime === "string" ? body.toTime : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";

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
  const slot = await prisma.availableSlot.create({
    data: {
      endsAt,
      startsAt,
      topic,
    },
    include: {
      bookings: {
        select: {
          id: true,
          studentEmail: true,
          studentName: true,
          studentPhone: true,
        },
      },
    },
  });

  return NextResponse.json({ slot: toAdminSlot(slot) }, { status: 201 });
}
