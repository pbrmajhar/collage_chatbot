import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminUser, listAdminUsers } from "@/lib/admin-users";
import { isDatabaseConfigured } from "@/lib/database";

type CreateAdminUserBody = {
  email?: unknown;
  name?: unknown;
  password?: unknown;
};

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    users: await listAdminUsers(),
  });
}

export async function POST(request: Request) {
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

  try {
    const body = (await request.json()) as CreateAdminUserBody;
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password =
      typeof body.password === "string" ? body.password.trim() : "";

    if (!email || !name || password.length < 8) {
      return NextResponse.json(
        { error: "Name, email, and an 8+ character password are required." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        user: await createAdminUser({
          email,
          name,
          password,
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin user create error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not create user.",
      },
      { status: 500 },
    );
  }
}
