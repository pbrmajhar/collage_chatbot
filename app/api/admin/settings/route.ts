import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  defaultAdminSettings,
  getAdminSettings,
  updateAdminSettings,
} from "@/lib/admin-settings";
import { isDatabaseConfigured } from "@/lib/database";

type UpdateSettingsBody = {
  chatBackgroundColor?: unknown;
  mainBackgroundColor?: unknown;
  subtitle?: unknown;
  title?: unknown;
  widgetBubbleIconUrl?: unknown;
};

function getColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback;
}

function getUrl(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  try {
    const url = new URL(trimmedValue);

    return url.protocol === "https:" || url.protocol === "http:"
      ? trimmedValue
      : "";
  } catch {
    return "";
  }
}

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
    const mainBackgroundColor = getColor(
      body.mainBackgroundColor,
      defaultAdminSettings.mainBackgroundColor,
    );
    const chatBackgroundColor = getColor(
      body.chatBackgroundColor,
      defaultAdminSettings.chatBackgroundColor,
    );
    const widgetBubbleIconUrl = getUrl(body.widgetBubbleIconUrl);

    if (!title || !subtitle) {
      return NextResponse.json(
        { error: "Title and subtitle are required." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      settings: await updateAdminSettings({
        chatBackgroundColor,
        mainBackgroundColor,
        subtitle,
        title,
        widgetBubbleIconUrl,
      }),
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
