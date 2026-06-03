import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  defaultAdminSettings,
  getAdminSettings,
  updateAdminSettings,
} from "@/lib/admin-settings";
import { isDatabaseConfigured } from "@/lib/database";

type UpdateSettingsBody = {
  authSecret?: unknown;
  authUrl?: unknown;
  bookingTriggerKeywords?: unknown;
  chatAccentColor?: unknown;
  chatAccentTextColor?: unknown;
  chatAssistantBubbleColor?: unknown;
  chatAssistantTextColor?: unknown;
  chatBackgroundColor?: unknown;
  chatHeaderBackgroundColor?: unknown;
  chatInputBackgroundColor?: unknown;
  chatInputPanelColor?: unknown;
  chatMutedTextColor?: unknown;
  chatUserBubbleColor?: unknown;
  chatUserTextColor?: unknown;
  databaseUrl?: unknown;
  directUrl?: unknown;
  geminiApiKey?: unknown;
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

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
    const bookingTriggerKeywords =
      typeof body.bookingTriggerKeywords === "string"
        ? body.bookingTriggerKeywords.trim()
        : defaultAdminSettings.bookingTriggerKeywords;
    const authSecret = getText(body.authSecret);
    const authUrl = getUrl(body.authUrl);
    const databaseUrl = getText(body.databaseUrl);
    const directUrl = getText(body.directUrl);
    const geminiApiKey = getText(body.geminiApiKey);
    const mainBackgroundColor = getColor(
      body.mainBackgroundColor,
      defaultAdminSettings.mainBackgroundColor,
    );
    const chatBackgroundColor = getColor(
      body.chatBackgroundColor,
      defaultAdminSettings.chatBackgroundColor,
    );
    const chatAccentColor = getColor(
      body.chatAccentColor,
      defaultAdminSettings.chatAccentColor,
    );
    const chatAccentTextColor = getColor(
      body.chatAccentTextColor,
      defaultAdminSettings.chatAccentTextColor,
    );
    const chatAssistantBubbleColor = getColor(
      body.chatAssistantBubbleColor,
      defaultAdminSettings.chatAssistantBubbleColor,
    );
    const chatAssistantTextColor = getColor(
      body.chatAssistantTextColor,
      defaultAdminSettings.chatAssistantTextColor,
    );
    const chatHeaderBackgroundColor = getColor(
      body.chatHeaderBackgroundColor,
      defaultAdminSettings.chatHeaderBackgroundColor,
    );
    const chatInputBackgroundColor = getColor(
      body.chatInputBackgroundColor,
      defaultAdminSettings.chatInputBackgroundColor,
    );
    const chatInputPanelColor = getColor(
      body.chatInputPanelColor,
      defaultAdminSettings.chatInputPanelColor,
    );
    const chatMutedTextColor = getColor(
      body.chatMutedTextColor,
      defaultAdminSettings.chatMutedTextColor,
    );
    const chatUserBubbleColor = getColor(
      body.chatUserBubbleColor,
      defaultAdminSettings.chatUserBubbleColor,
    );
    const chatUserTextColor = getColor(
      body.chatUserTextColor,
      defaultAdminSettings.chatUserTextColor,
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
        authSecret,
        authUrl,
        bookingTriggerKeywords,
        chatAccentColor,
        chatAccentTextColor,
        chatAssistantBubbleColor,
        chatAssistantTextColor,
        chatBackgroundColor,
        chatHeaderBackgroundColor,
        chatInputBackgroundColor,
        chatInputPanelColor,
        chatMutedTextColor,
        chatUserBubbleColor,
        chatUserTextColor,
        databaseUrl,
        directUrl,
        geminiApiKey,
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
