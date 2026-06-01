import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SlotStatus } from "@prisma/client";
import { formatCollegeInfoForPrompt, toContentLanguage } from "@/lib/college-info";
import { isDatabaseConfigured } from "@/lib/database";
import { getPrisma } from "@/lib/prisma";

type ChatRequestBody = {
  language?: unknown;
  message?: unknown;
};

type Language = "ja" | "en";

const apiCopy: Record<
  Language,
  {
    apiKeyMissing: string;
    messageRequired: string;
    unavailable: string;
    prompt: string;
    questionLabel: string;
  }
> = {
  ja: {
    apiKeyMissing: "Gemini APIキーが設定されていません。",
    messageRequired: "メッセージを入力してください。",
    unavailable: "現在、回答を生成できません。",
    prompt: `
あなたは「愛和システムエンジニア専門学校」の学校情報AIチャットボットです。
すべての回答は自然で丁寧な日本語で行ってください。
回答は短くしてください。通常は2〜4文、必要な場合のみ箇条書き3点以内にしてください。
予約について聞かれた場合は、Open booking slots にある空き枠だけを候補として提案してください。
学生や保護者に向けて、わかりやすく説明してください。
確実でない情報は断定せず、「学校の窓口に確認してください」と案内してください。
`,
    questionLabel: "質問",
  },
  en: {
    apiKeyMissing: "Gemini API key is not configured.",
    messageRequired: "Message is required.",
    unavailable: "Unable to generate a response right now.",
    prompt: `
You are the school information AI chatbot for Aiwa System Engineer College.
Answer everything in natural, polite English.
Keep answers short. Usually use 2-4 sentences, or at most 3 bullet points when helpful.
When asked about booking, suggest only the available times listed in Open booking slots.
Explain clearly for students and guardians.
If the information is uncertain, do not invent details. Ask the user to confirm with the school office.
`,
    questionLabel: "Question",
  },
};

function getLanguage(value: unknown): Language {
  return value === "en" ? "en" : "ja";
}

async function getCollegeInfo(language: Language) {
  if (isDatabaseConfigured()) {
    try {
      const prisma = getPrisma();
      const items = prisma.collegeInfo
        ? await prisma.collegeInfo.findMany({
            where: {
              isActive: true,
              language: toContentLanguage(language),
            },
            orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
          })
        : [];

      if (items.length > 0) {
        return formatCollegeInfoForPrompt(items);
      }
    } catch (error) {
      console.error("College info lookup error:", error);
    }
  }

  const filePath = path.join(process.cwd(), "data", "college-info.txt");
  const file = await readFile(filePath, "utf-8");
  const startMarker = `[${language}]`;
  const nextMarker = language === "ja" ? "[en]" : "[ja]";
  const startIndex = file.indexOf(startMarker);
  const nextIndex = file.indexOf(nextMarker, startIndex + startMarker.length);

  if (startIndex === -1) {
    return file;
  }

  return file
    .slice(
      startIndex + startMarker.length,
      nextIndex === -1 ? undefined : nextIndex,
    )
    .trim();
}

async function getOpenSlotInfo() {
  if (!isDatabaseConfigured()) {
    return "No database is configured yet, so live booking slots are unavailable.";
  }

  try {
    const prisma = getPrisma();
    const slots = await prisma.availableSlot.findMany({
      where: {
        status: SlotStatus.OPEN,
        startsAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        startsAt: "asc",
      },
      take: 5,
    });

    if (slots.length === 0) {
      return "No open booking slots are currently available.";
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Tokyo",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    });

    return slots
      .map((slot) => {
        const end = slot.endsAt
          ? timeFormatter.format(slot.endsAt)
          : "end time not set";

        return `- Slot ID ${slot.id}: ${formatter.format(slot.startsAt)}-${end}: ${slot.topic}`;
      })
      .join("\n");
  } catch (error) {
    console.error("Availability lookup error:", error);
    return "Live booking slots could not be loaded.";
  }
}

export async function POST(request: Request) {
  let copy = apiCopy.ja;

  try {
    const body = (await request.json()) as ChatRequestBody;
    const language = getLanguage(body.language);
    copy = apiCopy[language];

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: copy.apiKeyMissing },
        { status: 500 },
      );
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: copy.messageRequired },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
    const collegeInfo = await getCollegeInfo(language);
    const openSlotInfo = await getOpenSlotInfo();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${copy.prompt}\n\nCollege information:\n${collegeInfo}\n\nOpen booking slots:\n${openSlotInfo}\n\n${copy.questionLabel}: ${message}`,
    });

    return NextResponse.json({
      reply: response.text,
    });
  } catch (error) {
    console.error("Gemini chat error:", error);

    return NextResponse.json(
      { error: copy.unavailable },
      { status: 500 },
    );
  }
}
