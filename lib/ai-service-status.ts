import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

const aiServiceNoticeKey = "ai.service.notice";

export type AiServiceNotice = {
  createdAt: string;
  message: string;
  type: "rate_limit";
};

export async function getAiServiceNotice(): Promise<AiServiceNotice | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const prisma = getPrisma();

    if (!prisma.adminSetting) {
      return null;
    }

    const setting = await prisma.adminSetting.findUnique({
      where: {
        key: aiServiceNoticeKey,
      },
    });

    if (!setting?.value) {
      return null;
    }

    return JSON.parse(setting.value) as AiServiceNotice;
  } catch (error) {
    console.error("AI service notice lookup error:", error);
    return null;
  }
}

export async function saveAiServiceNotice(message: string) {
  if (!isDatabaseConfigured()) {
    return;
  }

  try {
    const prisma = getPrisma();

    if (!prisma.adminSetting) {
      return;
    }

    const notice: AiServiceNotice = {
      createdAt: new Date().toISOString(),
      message,
      type: "rate_limit",
    };

    await prisma.adminSetting.upsert({
      create: {
        key: aiServiceNoticeKey,
        value: JSON.stringify(notice),
      },
      update: {
        value: JSON.stringify(notice),
      },
      where: {
        key: aiServiceNoticeKey,
      },
    });
  } catch (error) {
    console.error("AI service notice save error:", error);
  }
}
