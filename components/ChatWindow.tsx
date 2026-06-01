"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Languages, Loader2 } from "lucide-react";
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
  reply?: string;
  error?: string;
};

function wantsBookingModal(message: string) {
  const normalized = message.trim().toLowerCase();

  return [
    "yes",
    "book",
    "booking",
    "reserve",
    "reservation",
    "ok",
    "はい",
    "予約",
    "お願いします",
    "お願い",
  ].some((word) => normalized.includes(word));
}

function createAssistantMessage(content: string): Message {
  return {
    content,
    role: "assistant",
  };
}

export function ChatWindow() {
  const [language, setLanguage] = useState<Language>("ja");
  const [messages, setMessages] = useState<Message[]>(() =>
    createInitialMessages("ja"),
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

    if (wantsBookingModal(trimmedInput)) {
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
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-7">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Languages aria-hidden="true" className="h-4 w-4 text-teal-300" />
          <span>{copy.languageLabel}</span>
        </div>
        <div
          className="inline-flex rounded-xl border border-white/10 bg-slate-900/80 p-1"
          role="group"
          aria-label={copy.languageLabel}
        >
          {(["ja", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleLanguageChange(option)}
              disabled={isLoading || language === option}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                language === option
                  ? "bg-teal-400 text-slate-950"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              } disabled:cursor-default`}
              aria-pressed={language === option}
            >
              {languageLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          {messages.map((message, index) => (
            <ChatMessage key={`${message.role}-${index}`} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-400 text-slate-950">
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              </div>
              <span>{copy.loading}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-slate-950/90 px-4 py-3 sm:px-5">
        <div className="mx-auto flex max-w-4xl justify-end">
          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            {copy.bookingButton}
          </button>
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
