import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

export type AdminSettings = {
  chatBackgroundColor: string;
  mainBackgroundColor: string;
  subtitle: string;
  title: string;
  widgetBubbleIconUrl: string;
};

export const defaultAdminSettings: AdminSettings = {
  chatBackgroundColor: "#020617",
  mainBackgroundColor: "#151515",
  subtitle: "Manage chatbot knowledge, booking slots, and admin settings.",
  title: "Admin Panel",
  widgetBubbleIconUrl: "",
};

const settingKeys = {
  chatBackgroundColor: "theme.background.chat",
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
      chatBackgroundColor: sanitizeColor(
        values.get(settingKeys.chatBackgroundColor) ||
          defaultAdminSettings.chatBackgroundColor,
        defaultAdminSettings.chatBackgroundColor,
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
