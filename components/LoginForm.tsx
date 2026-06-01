"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid admin email or password.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-slate-200">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20"
          placeholder="admin@example.com"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-200">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20"
          placeholder="••••••••"
          required
        />
      </label>

      {error && (
        <p className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        <LogIn aria-hidden="true" className="h-4 w-4" />
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
