import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { toAdminSlot, toSlotStatus } from "@/lib/slots";

type UpdateSlotBody = {
  status?: unknown;
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
  const status = typeof body.status === "string" ? body.status : "open";
  const prisma = getPrisma();

  const slot = await prisma.availableSlot.update({
    where: { id },
    data: {
      status: toSlotStatus(status),
    },
  });

  return NextResponse.json({ slot: toAdminSlot(slot) });
}
