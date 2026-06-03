"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { BookingPanel } from "@/components/BookingPanel";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage, type Message } from "@/components/ChatMessage";
import {
  languageLabels,
  type Language,
} from "@/components/language";

const chatCopy: Record<
  Language,
  {
    languageLabel: string;
    bookingButton: string;
    welcome: string;
    responseFallback: string;
    requestFallback: string;
    unknownError: string;
    serviceError: string;
    loading: string;
  }
> = {
  ja: {
    bookingButton: "予約",
    languageLabel: "回答言語",
    welcome: "こんにちは。学校について知りたいことを質問してください。",
    responseFallback: "回答を生成できませんでした。",
    requestFallback: "チャットボットが応答できませんでした。",
    unknownError: "問題が発生しました。もう一度お試しください。",
    serviceError: "AIサービスに接続できませんでした。APIキーを確認してください。",
    loading: "回答中...",
  },
  en: {
    bookingButton: "Book",
    languageLabel: "Response language",
    welcome: "Hello. Ask me anything about the school.",
    responseFallback: "I could not generate a response.",
    requestFallback: "The chatbot could not respond.",
    unknownError: "Something went wrong. Please try again.",
    serviceError: "Could not reach the AI service. Please check the API key.",
    loading: "Answering...",
  },
};

function createInitialMessages(language: Language): Message[] {
  return [
    {
      role: "assistant",
      content: chatCopy[language].welcome,
    },
  ];
}

type ChatResponse = {
  adminNotice?: boolean;
  reply?: string;
  error?: string;
};

function wantsBookingModal(message: string, keywords: string[]) {
  const normalized = message.trim().toLowerCase();

  return keywords.some((word) => normalized.includes(word.toLowerCase()));
}

function createAssistantMessage(content: string): Message {
  return {
    content,
    role: "assistant",
  };
}

type ChatWindowProps = {
  bookingTriggerKeywords?: string[];
  initialLanguage?: Language;
};

export function ChatWindow({
  bookingTriggerKeywords = [],
  initialLanguage = "ja",
}: ChatWindowProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [messages, setMessages] = useState<Message[]>(() =>
    createInitialMessages(initialLanguage),
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const copy = chatCopy[language];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setMessages(createInitialMessages(nextLanguage));
    setInput("");
    setError(null);
  }

  async function sendMessage() {
    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmedInput,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    if (wantsBookingModal(trimmedInput, bookingTriggerKeywords)) {
      setIsBookingModalOpen(true);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedInput, language }),
      });

      const data = (await response.json()) as ChatResponse;

      if (data.adminNotice) {
        console.error("Gemini chat admin notice:", data.error);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || copy.requestFallback);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || copy.responseFallback,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : copy.unknownError;

      setError(message);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: copy.serviceError,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex shrink-0 justify-end border-b border-white/10 px-4 py-3 sm:px-7"
        style={{ backgroundColor: "var(--chat-header-bg)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-xl border border-white/10 p-1"
            style={{ backgroundColor: "var(--chat-input-bg)" }}
            role="group"
            aria-label={copy.languageLabel}
          >
            {(["ja", "en"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleLanguageChange(option)}
                disabled={isLoading || language === option}
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-white/10 disabled:cursor-default"
                style={{
                  backgroundColor:
                    language === option ? "var(--chat-accent)" : "transparent",
                  color:
                    language === option
                      ? "var(--chat-accent-text)"
                      : "var(--chat-muted-text)",
                }}
                aria-pressed={language === option}
              >
                {languageLabels[option]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium transition hover:bg-white/10"
            style={{ color: "var(--chat-assistant-text)" }}
          >
            {copy.bookingButton}
          </button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7"
        style={{ backgroundColor: "var(--app-panel-bg)" }}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          {messages.map((message, index) => (
            <ChatMessage key={`${message.role}-${index}`} message={message} />
          ))}

          {isLoading && (
            <div
              className="flex items-center gap-3 text-sm"
              style={{ color: "var(--chat-muted-text)" }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "var(--chat-accent)",
                  color: "var(--chat-accent-text)",
                }}
              >
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              </div>
              <span>{copy.loading}</span>
            </div>
          )}

          {error && <p className="sr-only">{error}</p>}

          <div ref={bottomRef} />
        </div>
      </div>

      <BookingPanel
        isOpen={isBookingModalOpen}
        language={language}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={(message) =>
          setMessages((currentMessages) => [
            ...currentMessages,
            createAssistantMessage(message),
          ])
        }
      />

      <ChatInput
        input={input}
        isLoading={isLoading}
        language={language}
        onInputChange={setInput}
        onSubmit={sendMessage}
      />
    </section>
  );
}
