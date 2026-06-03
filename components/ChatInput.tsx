"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
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
  const isComposingRef = useRef(false);
  const ignoreNextEnterRef = useRef(false);
  const compositionEndTimerRef = useRef<number | null>(null);
  const copy = inputCopy[language];

  useEffect(() => {
    return () => {
      if (compositionEndTimerRef.current) {
        window.clearTimeout(compositionEndTimerRef.current);
      }
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isComposingRef.current) {
      return;
    }

    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const isImeComposing =
      isComposingRef.current ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229;

    if (isImeComposing) {
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      if (ignoreNextEnterRef.current) {
        ignoreNextEnterRef.current = false;
        event.preventDefault();
        return;
      }

      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-white/10 p-4 sm:p-5"
      style={{ backgroundColor: "var(--chat-input-panel-bg)" }}
    >
      <div
        className="flex items-end gap-3 rounded-2xl border border-white/10 p-2 shadow-inner shadow-black/20 focus-within:ring-2"
        style={{
          backgroundColor: "var(--chat-input-bg)",
          outlineColor: "var(--chat-accent)",
        }}
      >
        <textarea
          ref={textareaRef}
          aria-label={copy.ariaLabel}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onCompositionEnd={() => {
            isComposingRef.current = false;
            ignoreNextEnterRef.current = true;

            if (compositionEndTimerRef.current) {
              window.clearTimeout(compositionEndTimerRef.current);
            }

            compositionEndTimerRef.current = window.setTimeout(() => {
              ignoreNextEnterRef.current = false;
              compositionEndTimerRef.current = null;
            }, 30);
          }}
          onCompositionStart={() => {
            isComposingRef.current = true;
            ignoreNextEnterRef.current = false;

            if (compositionEndTimerRef.current) {
              window.clearTimeout(compositionEndTimerRef.current);
              compositionEndTimerRef.current = null;
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={copy.placeholder}
          rows={1}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-500"
          style={{ color: "var(--chat-assistant-text)" }}
        />
        <button
          type="submit"
          disabled={isLoading || input.trim().length === 0}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          style={{
            backgroundColor: "var(--chat-accent)",
            color: "var(--chat-accent-text)",
          }}
          title={copy.send}
          aria-label={copy.send}
        >
          <SendHorizontal aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
