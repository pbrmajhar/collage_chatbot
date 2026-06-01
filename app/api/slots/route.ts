import { SlotStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";
import { toAdminSlot } from "@/lib/slots";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ slots: [] });
  }

  const slots = await getPrisma().availableSlot.findMany({
    where: {
      status: SlotStatus.OPEN,
      startsAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: 8,
  });

  return NextResponse.json({
    slots: slots.map(toAdminSlot),
  });
}
