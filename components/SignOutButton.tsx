"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      ログアウト
    </button>
  );
}
