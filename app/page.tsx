import { GraduationCap } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import { getAdminSettings } from "@/lib/admin-settings";

function parseKeywords(value: string) {
  return value
    .split(/\r?\n/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export default async function Home() {
  const settings = await getAdminSettings();

  return (
    <main className="h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl shadow-black/30"
        style={{ backgroundColor: "var(--app-panel-bg)" }}
      >
        <header
          className="shrink-0 border-b border-white/10 px-5 py-4 sm:px-7"
          style={{ backgroundColor: "var(--chat-header-bg)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-glow"
              style={{
                backgroundColor: "var(--chat-accent)",
                color: "var(--chat-accent-text)",
              }}
            >
              <GraduationCap aria-hidden="true" className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="text-xl font-semibold tracking-tight sm:text-2xl"
                  style={{ color: "var(--chat-assistant-text)" }}
                >
                  愛和システムエンジニア専門学校
                </h1>
              </div>
            </div>
          </div>
        </header>

        <ChatWindow
          bookingTriggerKeywords={parseKeywords(settings.bookingTriggerKeywords)}
        />
      </div>
    </main>
  );
}
