import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { clearAiServiceNotice } from "@/lib/ai-service-status";

export async function DELETE() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearAiServiceNotice();

  return new NextResponse(null, { status: 204 });
}
