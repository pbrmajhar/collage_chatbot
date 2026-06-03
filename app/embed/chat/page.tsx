import { GraduationCap } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import type { Language } from "@/components/language";
import { getAdminSettings } from "@/lib/admin-settings";

type EmbedChatPageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

function getLanguage(value: string | undefined): Language {
  return value === "en" ? "en" : "ja";
}

function parseKeywords(value: string) {
  return value
    .split(/\r?\n/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export default async function EmbedChatPage({
  searchParams,
}: EmbedChatPageProps) {
  const params = await searchParams;
  const language = getLanguage(params?.lang);
  const settings = await getAdminSettings();

  return (
    <main className="h-screen overflow-hidden bg-[var(--app-panel-bg)] text-white">
      <div className="flex h-full min-h-0 flex-col">
        <header
          className="shrink-0 border-b border-white/10 px-4 py-3"
          style={{ backgroundColor: "var(--chat-header-bg)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--chat-accent)",
                color: "var(--chat-accent-text)",
              }}
            >
              <GraduationCap aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1
                className="truncate text-sm font-semibold"
                style={{ color: "var(--chat-assistant-text)" }}
              >
                愛和システムエンジニア専門学校
              </h1>
            </div>
          </div>
        </header>

        <ChatWindow
          bookingTriggerKeywords={parseKeywords(settings.bookingTriggerKeywords)}
          initialLanguage={language}
        />
      </div>
    </main>
  );
}
