import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

export type AdminSettings = {
  subtitle: string;
  title: string;
};

export const defaultAdminSettings: AdminSettings = {
  subtitle: "Manage chatbot knowledge, booking slots, and admin settings.",
  title: "Admin Panel",
};

const settingKeys = {
  subtitle: "admin.subtitle",
  title: "admin.title",
} satisfies Record<keyof AdminSettings, string>;

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
      subtitle:
        values.get(settingKeys.subtitle) || defaultAdminSettings.subtitle,
      title: values.get(settingKeys.title) || defaultAdminSettings.title,
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
  ]);

  return settings;
}
