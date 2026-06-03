import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteAdminUser, updateAdminUser } from "@/lib/admin-users";
import { isDatabaseConfigured } from "@/lib/database";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateAdminUserBody = {
  email?: unknown;
  isActive?: unknown;
  name?: unknown;
  password?: unknown;
};

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

  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateAdminUserBody;
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password =
      typeof body.password === "string" ? body.password.trim() : "";
    const isActive =
      typeof body.isActive === "boolean" ? body.isActive : true;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      user: await updateAdminUser(id, {
        currentAdminEmail: session.user.email,
        email,
        isActive,
        name,
        password: password || undefined,
      }),
    });
  } catch (error) {
    console.error("Admin user update error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update user.",
      },
      { status: 500 },
    );
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

  try {
    const { id } = await context.params;

    await deleteAdminUser(id, session.user.email);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Admin user delete error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete user.",
      },
      { status: 500 },
    );
  }
}
