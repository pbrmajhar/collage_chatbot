import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getAdminSettings } from "@/lib/admin-settings";
import "./globals.css";

export const metadata: Metadata = {
  title: "愛和システムエンジニア専門学校 AIチャットボット",
  description:
    "Next.js と Gemini API で構築した日本語・英語対応の学校情報AIチャットボットです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ThemedDocument>{children}</ThemedDocument>;
}

async function ThemedDocument({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getAdminSettings();

  return (
    <html lang="ja">
      <body
        style={
          {
            "--app-main-bg": settings.mainBackgroundColor,
            "--app-panel-bg": settings.chatBackgroundColor,
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
