import "dotenv/config";
import { PrismaClient, ContentLanguage } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

function extractSection(file, language) {
  const startMarker = `[${language}]`;
  const nextMarker = language === "ja" ? "[en]" : "[ja]";
  const startIndex = file.indexOf(startMarker);
  const nextIndex = file.indexOf(nextMarker, startIndex + startMarker.length);

  if (startIndex === -1) {
    return "";
  }

  return file
    .slice(
      startIndex + startMarker.length,
      nextIndex === -1 ? undefined : nextIndex,
    )
    .trim();
}

function titleFor(language) {
  return language === "ja" ? "基本情報" : "Basic information";
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const file = await readFile("data/college-info.txt", "utf-8");

for (const language of ["ja", "en"]) {
  const content = extractSection(file, language);

  if (!content) {
    continue;
  }

  await prisma.collegeInfo.create({
    data: {
      content,
      language: language === "ja" ? ContentLanguage.JA : ContentLanguage.EN,
      sortOrder: 0,
      title: titleFor(language),
    },
  });
}

await prisma.$disconnect();
await pool.end();

console.log("Seeded college info.");
