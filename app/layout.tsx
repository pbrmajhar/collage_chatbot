import type { Metadata } from "next";
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
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
