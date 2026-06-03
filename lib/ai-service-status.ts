import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

const aiServiceNoticeKey = "ai.service.notice";
const noticeTtlMs = 60 * 60 * 1000;

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

    const setting = prisma.adminSetting
      ? await prisma.adminSetting.findUnique({
          where: {
            key: aiServiceNoticeKey,
          },
        })
      : (
          await prisma.$queryRaw<Array<{ value: string }>>`
            SELECT "value"
            FROM "AdminSetting"
            WHERE "key" = ${aiServiceNoticeKey}
            LIMIT 1
          `
        )[0];

    if (!setting?.value) {
      return null;
    }

    const notice = JSON.parse(setting.value) as AiServiceNotice;
    const noticeAge = Date.now() - new Date(notice.createdAt).getTime();

    if (!Number.isFinite(noticeAge) || noticeAge > noticeTtlMs) {
      await clearAiServiceNotice();
      return null;
    }

    return notice;
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

    const notice: AiServiceNotice = {
      createdAt: new Date().toISOString(),
      message,
      type: "rate_limit",
    };

    if (prisma.adminSetting) {
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
    } else {
      await prisma.$executeRaw`
        INSERT INTO "AdminSetting" ("key", "value", "updatedAt")
        VALUES (${aiServiceNoticeKey}, ${JSON.stringify(notice)}, CURRENT_TIMESTAMP)
        ON CONFLICT ("key")
        DO UPDATE SET
          "value" = EXCLUDED."value",
          "updatedAt" = CURRENT_TIMESTAMP
      `;
    }
  } catch (error) {
    console.error("AI service notice save error:", error);
  }
}

export async function clearAiServiceNotice() {
  if (!isDatabaseConfigured()) {
    return;
  }

  try {
    const prisma = getPrisma();

    if (prisma.adminSetting) {
      await prisma.adminSetting.deleteMany({
        where: {
          key: aiServiceNoticeKey,
        },
      });
    } else {
      await prisma.$executeRaw`
        DELETE FROM "AdminSetting"
        WHERE "key" = ${aiServiceNoticeKey}
      `;
    }
  } catch (error) {
    console.error("AI service notice clear error:", error);
  }
}
