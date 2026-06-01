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
  const [title, setTitle] = useState(initialSettings.title);
  const [subtitle, setSubtitle] = useState(initialSettings.subtitle);
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
        body: JSON.stringify({ subtitle, title }),
      });
      const data = await readSettingsResponse(response);

      if (!response.ok || !data.settings) {
        throw new Error(data.error || "Could not save settings.");
      }

      setTitle(data.settings.title);
      setSubtitle(data.settings.subtitle);
      setMessage("Settings saved. Refresh or navigate to see the header update.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.06] p-4"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Admin title
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
              placeholder="Admin Panel"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Admin subtitle
            </span>
            <textarea
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              className="mt-1 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
              placeholder="Manage chatbot knowledge and booking slots."
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!isDatabaseReady || isSaving}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save settings"}
        </button>

        {!isDatabaseReady && (
          <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
            Database is not configured yet.
          </p>
        )}

        {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
      </form>
    </section>
  );
}
