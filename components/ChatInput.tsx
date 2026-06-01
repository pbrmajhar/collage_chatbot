"use client";

import { FormEvent, KeyboardEvent, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import type { Language } from "@/components/language";

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  language: Language;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
};

const inputCopy: Record<
  Language,
  {
    ariaLabel: string;
    placeholder: string;
    send: string;
  }
> = {
  ja: {
    ariaLabel: "メッセージ",
    placeholder: "入学案内、学科、学費、奨学金、就職について質問してください...",
    send: "送信",
  },
  en: {
    ariaLabel: "Message",
    placeholder: "Ask about admissions, courses, fees, scholarships...",
    send: "Send",
  },
};

export function ChatInput({
  input,
  isLoading,
  language,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copy = inputCopy[language];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-white/10 bg-slate-950/90 p-4 sm:p-5"
    >
      <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-2 shadow-inner shadow-black/20 focus-within:border-teal-300/70 focus-within:ring-2 focus-within:ring-teal-300/20">
        <textarea
          ref={textareaRef}
          aria-label={copy.ariaLabel}
          value={input}
          disabled={isLoading}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={copy.placeholder}
          rows={1}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || input.trim().length === 0}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400 text-slate-950 transition hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          title={copy.send}
          aria-label={copy.send}
        >
          <SendHorizontal aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
