import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toAdminBooking } from "@/lib/bookings";
import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
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

  const prisma = getPrisma();
  const bookings = await prisma.booking.findMany({
    include: {
      slot: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    bookings: bookings.map(toAdminBooking),
  });
}
