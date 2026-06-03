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
            "--chat-accent": settings.chatAccentColor,
            "--chat-accent-text": settings.chatAccentTextColor,
            "--chat-assistant-bubble": settings.chatAssistantBubbleColor,
            "--chat-assistant-text": settings.chatAssistantTextColor,
            "--chat-header-bg": settings.chatHeaderBackgroundColor,
            "--chat-input-bg": settings.chatInputBackgroundColor,
            "--chat-input-panel-bg": settings.chatInputPanelColor,
            "--chat-muted-text": settings.chatMutedTextColor,
            "--chat-user-bubble": settings.chatUserBubbleColor,
            "--chat-user-text": settings.chatUserTextColor,
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
