"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import type { AdminSettings } from "@/lib/admin-settings";

type AdminSettingsFormProps = {
  initialSettings: AdminSettings;
  isDatabaseReady: boolean;
};

type SettingsResponse = {
  error?: string;
  settings?: AdminSettings;
};

type SettingsTab = "admin" | "chat" | "runtime";

type ColorSetting = {
  key:
    | "chatAccentColor"
    | "chatAccentTextColor"
    | "chatAssistantBubbleColor"
    | "chatAssistantTextColor"
    | "chatBackgroundColor"
    | "chatHeaderBackgroundColor"
    | "chatInputBackgroundColor"
    | "chatInputPanelColor"
    | "chatMutedTextColor"
    | "chatUserBubbleColor"
    | "chatUserTextColor"
    | "mainBackgroundColor";
  label: string;
};

async function readSettingsResponse(response: Response): Promise<SettingsResponse> {
  const text = await response.text();

  if (!text) {
    return {
      error: `Empty response from server (${response.status}).`,
    };
  }

  try {
    return JSON.parse(text) as SettingsResponse;
  } catch {
    return {
      error: text,
    };
  }
}

export function AdminSettingsForm({
  initialSettings,
  isDatabaseReady,
}: AdminSettingsFormProps) {
  const [authSecret, setAuthSecret] = useState(initialSettings.authSecret);
  const [authUrl, setAuthUrl] = useState(initialSettings.authUrl);
  const [title, setTitle] = useState(initialSettings.title);
  const [subtitle, setSubtitle] = useState(initialSettings.subtitle);
  const [bookingTriggerKeywords, setBookingTriggerKeywords] = useState(
    initialSettings.bookingTriggerKeywords,
  );
  const [chatAccentColor, setChatAccentColor] = useState(
    initialSettings.chatAccentColor,
  );
  const [chatAccentTextColor, setChatAccentTextColor] = useState(
    initialSettings.chatAccentTextColor,
  );
  const [chatAssistantBubbleColor, setChatAssistantBubbleColor] = useState(
    initialSettings.chatAssistantBubbleColor,
  );
  const [chatAssistantTextColor, setChatAssistantTextColor] = useState(
    initialSettings.chatAssistantTextColor,
  );
  const [mainBackgroundColor, setMainBackgroundColor] = useState(
    initialSettings.mainBackgroundColor,
  );
  const [chatBackgroundColor, setChatBackgroundColor] = useState(
    initialSettings.chatBackgroundColor,
  );
  const [chatHeaderBackgroundColor, setChatHeaderBackgroundColor] = useState(
    initialSettings.chatHeaderBackgroundColor,
  );
  const [chatInputBackgroundColor, setChatInputBackgroundColor] = useState(
    initialSettings.chatInputBackgroundColor,
  );
  const [chatInputPanelColor, setChatInputPanelColor] = useState(
    initialSettings.chatInputPanelColor,
  );
  const [chatMutedTextColor, setChatMutedTextColor] = useState(
    initialSettings.chatMutedTextColor,
  );
  const [chatUserBubbleColor, setChatUserBubbleColor] = useState(
    initialSettings.chatUserBubbleColor,
  );
  const [chatUserTextColor, setChatUserTextColor] = useState(
    initialSettings.chatUserTextColor,
  );
  const [widgetBubbleIconUrl, setWidgetBubbleIconUrl] = useState(
    initialSettings.widgetBubbleIconUrl,
  );
  const [databaseUrl, setDatabaseUrl] = useState(initialSettings.databaseUrl);
  const [directUrl, setDirectUrl] = useState(initialSettings.directUrl);
  const [geminiApiKey, setGeminiApiKey] = useState(
    initialSettings.geminiApiKey,
  );
  const [activeTab, setActiveTab] = useState<SettingsTab>("admin");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authSecret,
          authUrl,
          bookingTriggerKeywords,
          chatBackgroundColor,
          chatAccentColor,
          chatAccentTextColor,
          chatAssistantBubbleColor,
          chatAssistantTextColor,
          chatHeaderBackgroundColor,
          chatInputBackgroundColor,
          chatInputPanelColor,
          chatMutedTextColor,
          chatUserBubbleColor,
          chatUserTextColor,
          databaseUrl,
          directUrl,
          geminiApiKey,
          mainBackgroundColor,
          subtitle,
          title,
          widgetBubbleIconUrl,
        }),
      });
      const data = await readSettingsResponse(response);

      if (!response.ok || !data.settings) {
        throw new Error(data.error || "Could not save settings.");
      }

      setAuthSecret(data.settings.authSecret);
      setAuthUrl(data.settings.authUrl);
      setTitle(data.settings.title);
      setSubtitle(data.settings.subtitle);
      setBookingTriggerKeywords(data.settings.bookingTriggerKeywords);
      setChatAccentColor(data.settings.chatAccentColor);
      setChatAccentTextColor(data.settings.chatAccentTextColor);
      setChatAssistantBubbleColor(data.settings.chatAssistantBubbleColor);
      setChatAssistantTextColor(data.settings.chatAssistantTextColor);
      setMainBackgroundColor(data.settings.mainBackgroundColor);
      setChatBackgroundColor(data.settings.chatBackgroundColor);
      setChatHeaderBackgroundColor(data.settings.chatHeaderBackgroundColor);
      setChatInputBackgroundColor(data.settings.chatInputBackgroundColor);
      setChatInputPanelColor(data.settings.chatInputPanelColor);
      setChatMutedTextColor(data.settings.chatMutedTextColor);
      setChatUserBubbleColor(data.settings.chatUserBubbleColor);
      setChatUserTextColor(data.settings.chatUserTextColor);
      setDatabaseUrl(data.settings.databaseUrl);
      setDirectUrl(data.settings.directUrl);
      setGeminiApiKey(data.settings.geminiApiKey);
      setWidgetBubbleIconUrl(data.settings.widgetBubbleIconUrl);
      setMessage("設定を保存しました。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "設定を保存できませんでした。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const colorValues = {
    chatAccentColor,
    chatAccentTextColor,
    chatAssistantBubbleColor,
    chatAssistantTextColor,
    chatBackgroundColor,
    chatHeaderBackgroundColor,
    chatInputBackgroundColor,
    chatInputPanelColor,
    chatMutedTextColor,
    chatUserBubbleColor,
    chatUserTextColor,
    mainBackgroundColor,
  };

  const colorSetters = {
    chatAccentColor: setChatAccentColor,
    chatAccentTextColor: setChatAccentTextColor,
    chatAssistantBubbleColor: setChatAssistantBubbleColor,
    chatAssistantTextColor: setChatAssistantTextColor,
    chatBackgroundColor: setChatBackgroundColor,
    chatHeaderBackgroundColor: setChatHeaderBackgroundColor,
    chatInputBackgroundColor: setChatInputBackgroundColor,
    chatInputPanelColor: setChatInputPanelColor,
    chatMutedTextColor: setChatMutedTextColor,
    chatUserBubbleColor: setChatUserBubbleColor,
    chatUserTextColor: setChatUserTextColor,
    mainBackgroundColor: setMainBackgroundColor,
  };

  function renderColorGrid(settings: ColorSetting[]) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {settings.map((setting) => (
          <label
            key={setting.key}
            className="rounded-xl border border-white/10 bg-slate-900 p-3"
          >
            <span className="block text-xs text-slate-400">
              {setting.label}
            </span>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={colorValues[setting.key]}
                onChange={(event) =>
                  colorSetters[setting.key](event.target.value)
                }
                className="h-9 w-12 rounded border border-white/10 bg-transparent"
              />
              <input
                value={colorValues[setting.key]}
                onChange={(event) =>
                  colorSetters[setting.key](event.target.value)
                }
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
              />
            </div>
          </label>
        ))}
      </div>
    );
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.06] p-4"
      >
        <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-slate-900/80 p-1">
          {[
            { id: "admin", label: "管理画面" },
            { id: "chat", label: "チャット" },
            { id: "runtime", label: "API・DB" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-teal-400 text-slate-950"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "admin" ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                管理画面タイトル
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="管理画面"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                管理画面サブタイトル
              </span>
              <textarea
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                className="mt-1 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="学校情報、予約枠、設定を管理します。"
                required
              />
            </label>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                管理画面の背景色
              </span>
              <div className="mt-2">
                {renderColorGrid([
                  { key: "mainBackgroundColor", label: "メイン背景" },
                  { key: "chatBackgroundColor", label: "パネル背景" },
                ])}
              </div>
            </div>
          </div>
        ) : activeTab === "chat" ? (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                チャット全体
              </span>
              <div className="mt-2">
                {renderColorGrid([
                  { key: "chatBackgroundColor", label: "チャット背景" },
                  { key: "chatHeaderBackgroundColor", label: "ヘッダー背景" },
                  { key: "chatInputPanelColor", label: "入力エリア背景" },
                  { key: "chatInputBackgroundColor", label: "入力欄背景" },
                  { key: "chatMutedTextColor", label: "補助テキスト" },
                ])}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                アクセント
              </span>
              <div className="mt-2">
                {renderColorGrid([
                  { key: "chatAccentColor", label: "アクセント色" },
                  { key: "chatAccentTextColor", label: "アクセント文字" },
                ])}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                メッセージ
              </span>
              <div className="mt-2">
                {renderColorGrid([
                  { key: "chatUserBubbleColor", label: "ユーザー吹き出し" },
                  { key: "chatUserTextColor", label: "ユーザー文字" },
                  {
                    key: "chatAssistantBubbleColor",
                    label: "AI吹き出し",
                  },
                  { key: "chatAssistantTextColor", label: "AI文字" },
                ])}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                ウィジェットバブルアイコンURL
              </span>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="url"
                  value={widgetBubbleIconUrl}
                  onChange={(event) =>
                    setWidgetBubbleIconUrl(event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                  placeholder="https://example.com/chat-icon.png"
                />
                {widgetBubbleIconUrl && (
                  <div
                    aria-hidden="true"
                    className="h-11 w-11 shrink-0 rounded-full bg-teal-400 bg-cover bg-center"
                    style={{ backgroundImage: `url(${widgetBubbleIconUrl})` }}
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                空の場合は標準のチャットアイコンを表示します。
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                予約モーダルを開くキーワード
              </span>
              <textarea
                value={bookingTriggerKeywords}
                onChange={(event) =>
                  setBookingTriggerKeywords(event.target.value)
                }
                className="mt-1 min-h-32 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder={"予約\nbook\nはい"}
              />
              <p className="mt-1 text-xs text-slate-500">
                1行に1つずつ入力してください。ユーザーのメッセージに含まれると予約モーダルを開きます。
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
              ここに保存した値は管理用にデータベースへ保存されます。DATABASE_URLとAUTH_SECRETはアプリ起動時に必要なため、本番環境ではVercelの環境変数にも設定してください。
            </div>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Gemini APIキー
              </span>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(event) => setGeminiApiKey(event.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="GEMINI_API_KEY"
              />
              <p className="mt-1 text-xs text-slate-500">
                .env.local の GEMINI_API_KEY がない場合、チャットAPIはこの値を使用します。
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                データベースURL
              </span>
              <input
                type="password"
                value={databaseUrl}
                onChange={(event) => setDatabaseUrl(event.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="DATABASE_URL"
              />
              <p className="mt-1 text-xs text-slate-500">
                Prisma接続には起動前の環境変数 DATABASE_URL が必要です。
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                ダイレクトURL
              </span>
              <input
                type="password"
                value={directUrl}
                onChange={(event) => setDirectUrl(event.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="DIRECT_URL"
              />
              <p className="mt-1 text-xs text-slate-500">
                マイグレーション用の直接接続URLがある場合に保存します。
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Auth Secret
              </span>
              <input
                type="password"
                value={authSecret}
                onChange={(event) => setAuthSecret(event.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="AUTH_SECRET"
              />
              <p className="mt-1 text-xs text-slate-500">
                Auth.jsは起動時に AUTH_SECRET を読むため、環境変数にも設定してください。
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Auth URL
              </span>
              <input
                type="url"
                value={authUrl}
                onChange={(event) => setAuthUrl(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="https://example.com"
              />
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={!isDatabaseReady || isSaving}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {isSaving ? "保存中..." : "設定を保存"}
        </button>

        {!isDatabaseReady && (
          <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
            データベースがまだ設定されていません。
          </p>
        )}

        {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
      </form>
    </section>
  );
}
