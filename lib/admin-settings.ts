import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

export type AdminSettings = {
  authSecret: string;
  authUrl: string;
  bookingTriggerKeywords: string;
  chatAccentColor: string;
  chatAccentTextColor: string;
  chatAssistantBubbleColor: string;
  chatAssistantTextColor: string;
  chatBackgroundColor: string;
  chatHeaderBackgroundColor: string;
  chatInputBackgroundColor: string;
  chatInputPanelColor: string;
  chatMutedTextColor: string;
  chatUserBubbleColor: string;
  chatUserTextColor: string;
  databaseUrl: string;
  directUrl: string;
  geminiApiKey: string;
  mainBackgroundColor: string;
  subtitle: string;
  title: string;
  widgetBubbleIconUrl: string;
};

export const defaultAdminSettings: AdminSettings = {
  authSecret: "",
  authUrl: "",
  bookingTriggerKeywords:
    "yes\nbook\nbooking\nreserve\nreservation\nok\nはい\n予約\nお願いします\nお願い",
  chatAccentColor: "#2dd4bf",
  chatAccentTextColor: "#020617",
  chatAssistantBubbleColor: "#1f2937",
  chatAssistantTextColor: "#f1f5f9",
  chatBackgroundColor: "#020617",
  chatHeaderBackgroundColor: "#020617",
  chatInputBackgroundColor: "#0f172a",
  chatInputPanelColor: "#020617",
  chatMutedTextColor: "#cbd5e1",
  chatUserBubbleColor: "#2dd4bf",
  chatUserTextColor: "#020617",
  databaseUrl: "",
  directUrl: "",
  geminiApiKey: "",
  mainBackgroundColor: "#151515",
  subtitle: "Manage chatbot knowledge, booking slots, and admin settings.",
  title: "Admin Panel",
  widgetBubbleIconUrl: "",
};

const settingKeys = {
  authSecret: "runtime.auth.secret",
  authUrl: "runtime.auth.url",
  bookingTriggerKeywords: "chat.booking.triggerKeywords",
  chatAccentColor: "chat.theme.accent",
  chatAccentTextColor: "chat.theme.accentText",
  chatAssistantBubbleColor: "chat.theme.assistantBubble",
  chatAssistantTextColor: "chat.theme.assistantText",
  chatBackgroundColor: "theme.background.chat",
  chatHeaderBackgroundColor: "chat.theme.headerBackground",
  chatInputBackgroundColor: "chat.theme.inputBackground",
  chatInputPanelColor: "chat.theme.inputPanel",
  chatMutedTextColor: "chat.theme.mutedText",
  chatUserBubbleColor: "chat.theme.userBubble",
  chatUserTextColor: "chat.theme.userText",
  databaseUrl: "runtime.database.url",
  directUrl: "runtime.database.directUrl",
  geminiApiKey: "runtime.gemini.apiKey",
  mainBackgroundColor: "theme.background.main",
  subtitle: "admin.subtitle",
  title: "admin.title",
  widgetBubbleIconUrl: "widget.bubble.iconUrl",
} satisfies Record<keyof AdminSettings, string>;

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function sanitizeColor(value: string, fallback: string) {
  return isHexColor(value) ? value : fallback;
}

function sanitizeUrl(value: string) {
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

function sanitizeSecret(value: string) {
  return value.trim();
}

export async function getAdminSettings(): Promise<AdminSettings> {
  if (!isDatabaseConfigured()) {
    return defaultAdminSettings;
  }

  try {
    const prisma = getPrisma();

    if (!prisma.adminSetting) {
      return defaultAdminSettings;
    }

    const settings = await prisma.adminSetting.findMany({
      where: {
        key: {
          in: Object.values(settingKeys),
        },
      },
    });
    const values = new Map(
      settings.map((setting) => [setting.key, setting.value]),
    );

    return {
      authSecret: sanitizeSecret(
        values.get(settingKeys.authSecret) || defaultAdminSettings.authSecret,
      ),
      authUrl: sanitizeUrl(
        values.get(settingKeys.authUrl) || defaultAdminSettings.authUrl,
      ),
      chatAccentColor: sanitizeColor(
        values.get(settingKeys.chatAccentColor) ||
          defaultAdminSettings.chatAccentColor,
        defaultAdminSettings.chatAccentColor,
      ),
      chatAccentTextColor: sanitizeColor(
        values.get(settingKeys.chatAccentTextColor) ||
          defaultAdminSettings.chatAccentTextColor,
        defaultAdminSettings.chatAccentTextColor,
      ),
      chatAssistantBubbleColor: sanitizeColor(
        values.get(settingKeys.chatAssistantBubbleColor) ||
          defaultAdminSettings.chatAssistantBubbleColor,
        defaultAdminSettings.chatAssistantBubbleColor,
      ),
      chatAssistantTextColor: sanitizeColor(
        values.get(settingKeys.chatAssistantTextColor) ||
          defaultAdminSettings.chatAssistantTextColor,
        defaultAdminSettings.chatAssistantTextColor,
      ),
      chatBackgroundColor: sanitizeColor(
        values.get(settingKeys.chatBackgroundColor) ||
          defaultAdminSettings.chatBackgroundColor,
        defaultAdminSettings.chatBackgroundColor,
      ),
      chatHeaderBackgroundColor: sanitizeColor(
        values.get(settingKeys.chatHeaderBackgroundColor) ||
          defaultAdminSettings.chatHeaderBackgroundColor,
        defaultAdminSettings.chatHeaderBackgroundColor,
      ),
      chatInputBackgroundColor: sanitizeColor(
        values.get(settingKeys.chatInputBackgroundColor) ||
          defaultAdminSettings.chatInputBackgroundColor,
        defaultAdminSettings.chatInputBackgroundColor,
      ),
      chatInputPanelColor: sanitizeColor(
        values.get(settingKeys.chatInputPanelColor) ||
          defaultAdminSettings.chatInputPanelColor,
        defaultAdminSettings.chatInputPanelColor,
      ),
      chatMutedTextColor: sanitizeColor(
        values.get(settingKeys.chatMutedTextColor) ||
          defaultAdminSettings.chatMutedTextColor,
        defaultAdminSettings.chatMutedTextColor,
      ),
      chatUserBubbleColor: sanitizeColor(
        values.get(settingKeys.chatUserBubbleColor) ||
          defaultAdminSettings.chatUserBubbleColor,
        defaultAdminSettings.chatUserBubbleColor,
      ),
      chatUserTextColor: sanitizeColor(
        values.get(settingKeys.chatUserTextColor) ||
          defaultAdminSettings.chatUserTextColor,
        defaultAdminSettings.chatUserTextColor,
      ),
      bookingTriggerKeywords:
        values.get(settingKeys.bookingTriggerKeywords) ||
        defaultAdminSettings.bookingTriggerKeywords,
      databaseUrl: sanitizeSecret(
        values.get(settingKeys.databaseUrl) ||
          defaultAdminSettings.databaseUrl,
      ),
      directUrl: sanitizeSecret(
        values.get(settingKeys.directUrl) || defaultAdminSettings.directUrl,
      ),
      geminiApiKey: sanitizeSecret(
        values.get(settingKeys.geminiApiKey) ||
          defaultAdminSettings.geminiApiKey,
      ),
      mainBackgroundColor: sanitizeColor(
        values.get(settingKeys.mainBackgroundColor) ||
          defaultAdminSettings.mainBackgroundColor,
        defaultAdminSettings.mainBackgroundColor,
      ),
      subtitle:
        values.get(settingKeys.subtitle) || defaultAdminSettings.subtitle,
      title: values.get(settingKeys.title) || defaultAdminSettings.title,
      widgetBubbleIconUrl: sanitizeUrl(
        values.get(settingKeys.widgetBubbleIconUrl) ||
          defaultAdminSettings.widgetBubbleIconUrl,
      ),
    };
  } catch (error) {
    console.error("Admin settings lookup error:", error);
    return defaultAdminSettings;
  }
}

export async function updateAdminSettings(settings: AdminSettings) {
  const prisma = getPrisma();

  if (!prisma.adminSetting) {
    throw new Error(
      "Prisma Client is not generated for AdminSetting yet. Run prisma generate and restart the dev server.",
    );
  }

  await prisma.$transaction([
    ...[
      "authSecret",
      "databaseUrl",
      "directUrl",
      "geminiApiKey",
    ].map((key) => {
      const settingKey = key as keyof AdminSettings;
      const value = sanitizeSecret(settings[settingKey]);

      return prisma.adminSetting.upsert({
        create: {
          key: settingKeys[settingKey],
          value,
        },
        update: {
          value,
        },
        where: {
          key: settingKeys[settingKey],
        },
      });
    }),
    ...[
      "chatAccentColor",
      "chatAccentTextColor",
      "chatAssistantBubbleColor",
      "chatAssistantTextColor",
      "chatHeaderBackgroundColor",
      "chatInputBackgroundColor",
      "chatInputPanelColor",
      "chatMutedTextColor",
      "chatUserBubbleColor",
      "chatUserTextColor",
    ].map((key) => {
      const settingKey = key as keyof AdminSettings;
      const value = sanitizeColor(
        settings[settingKey],
        defaultAdminSettings[settingKey],
      );

      return prisma.adminSetting.upsert({
        create: {
          key: settingKeys[settingKey],
          value,
        },
        update: {
          value,
        },
        where: {
          key: settingKeys[settingKey],
        },
      });
    }),
    prisma.adminSetting.upsert({
      create: {
        key: settingKeys.authUrl,
        value: sanitizeUrl(settings.authUrl),
      },
      update: {
        value: sanitizeUrl(settings.authUrl),
      },
      where: {
        key: settingKeys.authUrl,
      },
    }),
    prisma.adminSetting.upsert({
      create: {
        key: settingKeys.bookingTriggerKeywords,
        value: settings.bookingTriggerKeywords,
      },
      update: {
        value: settings.bookingTriggerKeywords,
      },
      where: {
        key: settingKeys.bookingTriggerKeywords,
      },
    }),
    prisma.adminSetting.upsert({
      create: {
        key: settingKeys.mainBackgroundColor,
        value: sanitizeColor(
          settings.mainBackgroundColor,
          defaultAdminSettings.mainBackgroundColor,
        ),
      },
      update: {
        value: sanitizeColor(
          settings.mainBackgroundColor,
          defaultAdminSettings.mainBackgroundColor,
        ),
      },
      where: {
        key: settingKeys.mainBackgroundColor,
      },
    }),
    prisma.adminSetting.upsert({
      create: {
        key: settingKeys.chatBackgroundColor,
        value: sanitizeColor(
          settings.chatBackgroundColor,
          defaultAdminSettings.chatBackgroundColor,
        ),
      },
      update: {
        value: sanitizeColor(
          settings.chatBackgroundColor,
          defaultAdminSettings.chatBackgroundColor,
        ),
      },
      where: {
        key: settingKeys.chatBackgroundColor,
      },
    }),
    prisma.adminSetting.upsert({
      create: {
        key: settingKeys.title,
        value: settings.title,
      },
      update: {
        value: settings.title,
      },
      where: {
        key: settingKeys.title,
      },
    }),
    prisma.adminSetting.upsert({
      create: {
        key: settingKeys.subtitle,
        value: settings.subtitle,
      },
      update: {
        value: settings.subtitle,
      },
      where: {
        key: settingKeys.subtitle,
      },
    }),
    prisma.adminSetting.upsert({
      create: {
        key: settingKeys.widgetBubbleIconUrl,
        value: sanitizeUrl(settings.widgetBubbleIconUrl),
      },
      update: {
        value: sanitizeUrl(settings.widgetBubbleIconUrl),
      },
      where: {
        key: settingKeys.widgetBubbleIconUrl,
      },
    }),
  ]);

  return settings;
}
