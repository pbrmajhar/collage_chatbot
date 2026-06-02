import { GraduationCap } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import type { Language } from "@/components/language";

type EmbedChatPageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

function getLanguage(value: string | undefined): Language {
  return value === "en" ? "en" : "ja";
}

export default async function EmbedChatPage({
  searchParams,
}: EmbedChatPageProps) {
  const params = await searchParams;
  const language = getLanguage(params?.lang);

  return (
    <main className="h-screen overflow-hidden bg-[var(--app-panel-bg)] text-white">
      <div className="flex h-full min-h-0 flex-col">
        <header className="shrink-0 border-b border-white/10 bg-slate-950/70 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-400 text-slate-950">
              <GraduationCap aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-white">
                愛和システムエンジニア専門学校
              </h1>
              <p className="text-xs text-slate-300">
                College Information AI Chatbot
              </p>
            </div>
          </div>
        </header>

        <ChatWindow initialLanguage={language} />
      </div>
    </main>
  );
}
