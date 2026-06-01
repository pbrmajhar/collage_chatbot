"use client";

import { FormEvent, useState } from "react";
import { BookOpenText, Plus, Save, Trash2 } from "lucide-react";
import type {
  AdminCollegeInfo,
  CollegeInfoLanguage,
} from "@/lib/college-info";

type CollegeInfoManagerProps = {
  initialItems: AdminCollegeInfo[];
  isDatabaseReady: boolean;
};

type ApiResponse = {
  error?: string;
  item?: AdminCollegeInfo;
};

const languageOptions: Array<{
  label: string;
  value: CollegeInfoLanguage;
}> = [
  { label: "日本語", value: "ja" },
  { label: "English", value: "en" },
];

export function CollegeInfoManager({
  initialItems,
  isDatabaseReady,
}: CollegeInfoManagerProps) {
  const [items, setItems] = useState<AdminCollegeInfo[]>(initialItems);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState<CollegeInfoLanguage>("ja");
  const [sortOrder, setSortOrder] = useState(0);
  const [title, setTitle] = useState("");

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/college-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, language, sortOrder, title }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.item) {
        throw new Error(data.error || "Could not save information.");
      }

      setItems((current) => [...current, data.item!]);
      setContent("");
      setSortOrder(0);
      setTitle("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save information.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateItem(
    id: string,
    patch: Partial<AdminCollegeInfo>,
  ) {
    setError(null);

    try {
      const response = await fetch(`/api/admin/college-info/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.item) {
        throw new Error(data.error || "Could not update information.");
      }

      setItems((current) =>
        current.map((item) => (item.id === id ? data.item! : item)),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update information.",
      );
    }
  }

  async function deleteItem(id: string) {
    setError(null);

    try {
      const response = await fetch(`/api/admin/college-info/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete information.");
      }

      setItems((current) => current.filter((item) => item.id !== id));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete information.",
      );
    }
  }

  return (
    <section className="px-5 py-5 sm:px-7">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <BookOpenText aria-hidden="true" className="h-4 w-4 text-teal-300" />
        College information database
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={createItem}
          className="h-fit rounded-2xl border border-white/10 bg-white/[0.06] p-4"
        >
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Language
              </span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as CollegeInfoLanguage)
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-300/70"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Title
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="Admissions"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Sort order
              </span>
              <input
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(Number(event.target.value))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-300/70"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Content
              </span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="mt-1 min-h-32 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="Write the information the bot should use..."
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!isDatabaseReady || isSaving}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            {isSaving ? "Saving..." : "Add information"}
          </button>
        </form>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-slate-300">
              No database information yet. The bot will use the text file
              fallback until you add entries here.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-teal-400/15 px-2 py-1 text-xs font-semibold text-teal-100">
                    {item.language === "ja" ? "日本語" : "English"}
                  </span>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(event) =>
                        void updateItem(item.id, {
                          isActive: event.target.checked,
                        })
                      }
                    />
                    Active
                  </label>
                </div>

                <input
                  value={item.title}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, title: event.target.value }
                          : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-teal-300/70"
                />

                <textarea
                  value={item.content}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, content: event.target.value }
                          : entry,
                      ),
                    )
                  }
                  className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void updateItem(item.id, {
                        content: item.content,
                        title: item.title,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-teal-300"
                  >
                    <Save aria-hidden="true" className="h-3.5 w-3.5" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteItem(item.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-400/20"
                  >
                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {error && (
            <p className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
