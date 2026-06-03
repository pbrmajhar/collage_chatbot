import { Bot, User } from "lucide-react";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: "var(--chat-accent)",
            color: "var(--chat-accent-text)",
          }}
        >
          <Bot aria-hidden="true" className="h-5 w-5" />
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg sm:max-w-[70%] ${
          isUser ? "rounded-br-md" : "rounded-bl-md border border-white/10"
        }`}
        style={{
          backgroundColor: isUser
            ? "var(--chat-user-bubble)"
            : "var(--chat-assistant-bubble)",
          color: isUser ? "var(--chat-user-text)" : "var(--chat-assistant-text)",
        }}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {isUser && (
        <div
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: "var(--chat-user-bubble)",
            color: "var(--chat-user-text)",
          }}
        >
          <User aria-hidden="true" className="h-5 w-5" />
        </div>
      )}
    </article>
  );
}
