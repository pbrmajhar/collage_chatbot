"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

export function AiServiceNoticeDismissButton() {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  async function clearNotice() {
    setIsClearing(true);

    try {
      await fetch("/api/admin/ai-service-notice", {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void clearNotice()}
      disabled={isClearing}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-100/20 bg-amber-100/10 text-amber-50 transition hover:bg-amber-100/20 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="通知を閉じる"
      title="通知を閉じる"
    >
      <X aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
