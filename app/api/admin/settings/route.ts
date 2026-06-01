import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  defaultAdminSettings,
  getAdminSettings,
  updateAdminSettings,
} from "@/lib/admin-settings";
import { isDatabaseConfigured } from "@/lib/database";

type UpdateSettingsBody = {
  subtitle?: unknown;
  title?: unknown;
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      settings: await getAdminSettings(),
    });
  } catch (error) {
    console.error("Admin settings GET error:", error);

    return NextResponse.json(
      { error: "Could not load settings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
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

    const body = (await request.json()) as UpdateSettingsBody;
    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : defaultAdminSettings.title;
    const subtitle =
      typeof body.subtitle === "string"
        ? body.subtitle.trim()
        : defaultAdminSettings.subtitle;

    if (!title || !subtitle) {
      return NextResponse.json(
        { error: "Title and subtitle are required." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      settings: await updateAdminSettings({ subtitle, title }),
    });
  } catch (error) {
    console.error("Admin settings PATCH error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save settings.",
      },
      { status: 500 },
    );
  }
}
