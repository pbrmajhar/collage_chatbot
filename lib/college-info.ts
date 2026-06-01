import { ContentLanguage, type CollegeInfo } from "@prisma/client";

export type CollegeInfoLanguage = "ja" | "en";

export type AdminCollegeInfo = {
  content: string;
  id: string;
  isActive: boolean;
  language: CollegeInfoLanguage;
  sortOrder: number;
  title: string;
};

export function toContentLanguage(language: string) {
  return language === "en" ? ContentLanguage.EN : ContentLanguage.JA;
}

export function fromContentLanguage(language: ContentLanguage) {
  return language === ContentLanguage.EN ? "en" : "ja";
}

export function toAdminCollegeInfo(info: CollegeInfo): AdminCollegeInfo {
  return {
    content: info.content,
    id: info.id,
    isActive: info.isActive,
    language: fromContentLanguage(info.language),
    sortOrder: info.sortOrder,
    title: info.title,
  };
}

export function formatCollegeInfoForPrompt(items: CollegeInfo[]) {
  return items
    .map((item) => `${item.title}:\n${item.content}`)
    .join("\n\n");
}
