"use client";

import { FormEvent, useState } from "react";
import {
  CalendarPlus,
  Clock,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { AdminSlot } from "@/lib/slots";

type AdminSlotManagerProps = {
  initialSlots: AdminSlot[];
  isDatabaseReady: boolean;
};

type EditableSlot = {
  date: string;
  fromTime: string;
  status: AdminSlot["status"];
  topic: string;
  toTime: string;
};

type SlotResponse = {
  error?: string;
  slot?: AdminSlot;
};

function toEditableSlot(slot: AdminSlot): EditableSlot {
  return {
    date: slot.date,
    fromTime: slot.fromTime,
    status: slot.status,
    topic: slot.topic,
    toTime: slot.toTime,
  };
}

async function readSlotResponse(response: Response): Promise<SlotResponse> {
  const text = await response.text();

  if (!text) {
    return {
      error: `Empty response from server (${response.status}).`,
    };
  }

  try {
    return JSON.parse(text) as SlotResponse;
  } catch {
    return {
      error: text,
    };
  }
}

export function AdminSlotManager({
  initialSlots,
  isDatabaseReady,
}: AdminSlotManagerProps) {
  const [slots, setSlots] = useState<AdminSlot[]>(initialSlots);
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [topic, setTopic] = useState("");
  const [toTime, setToTime] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedPeopleId, setExpandedPeopleId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAddSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || !fromTime || !toTime || !topic.trim()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, fromTime, toTime, topic }),
      });
      const data = await readSlotResponse(response);

      if (!response.ok || !data.slot) {
        throw new Error(data.error || "Could not create slot.");
      }

      setSlots((currentSlots) => [...currentSlots, data.slot as AdminSlot]);
      setDate("");
      setFromTime("");
      setTopic("");
      setToTime("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create slot.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(slot: AdminSlot) {
    setError(null);
    setEditingId(slot.id);
    setDraft(toEditableSlot(slot));
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft(null);
  }

  function updateDraft<Value extends keyof EditableSlot>(
    key: Value,
    value: EditableSlot[Value],
  ) {
    setDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, [key]: value } : currentDraft,
    );
  }

  async function saveSlot(slotId: string) {
    if (!draft) {
      return;
    }

    setSavingId(slotId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/slots/${slotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });
      const data = await readSlotResponse(response);

      if (!response.ok || !data.slot) {
        throw new Error(data.error || "Could not update slot.");
      }

      setSlots((currentSlots) =>
        currentSlots.map((slot) =>
          slot.id === data.slot?.id ? data.slot : slot,
        ),
      );
      cancelEditing();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update slot.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deleteSlot(slot: AdminSlot) {
    if (slot.bookings.length > 0) {
      setError("この予約枠には予約があります。先に予約を削除または移動してください。");
      return;
    }

    const shouldDelete = window.confirm("この予約枠を削除しますか？");

    if (!shouldDelete) {
      return;
    }

    setDeletingId(slot.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/slots/${slot.id}`, {
        method: "DELETE",
      });
      const data = await readSlotResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Could not delete slot.");
      }

      setSlots((currentSlots) =>
        currentSlots.filter((currentSlot) => currentSlot.id !== slot.id),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete slot.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="px-5 py-5 sm:px-7">
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <form
          onSubmit={handleAddSlot}
          className="h-fit rounded-2xl border border-white/10 bg-white/[0.06] p-4"
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarPlus
              aria-hidden="true"
              className="h-4 w-4 text-teal-300"
            />
            予約枠を作成する
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                日付
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-300/70"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                開始
              </span>
              <input
                type="time"
                value={fromTime}
                onChange={(event) => setFromTime(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-300/70"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                終了
              </span>
              <input
                type="time"
                value={toTime}
                onChange={(event) => setToTime(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-300/70"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                内容
              </span>
              <input
                type="text"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="オープンキャンパス相談"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving || !isDatabaseReady}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            {isSaving ? "保存中..." : "予約枠を追加"}
          </button>

          {!isDatabaseReady && (
            <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
              データベースがまだ設定されていません。
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          )}
        </form>

        <div className="space-y-3">
          {slots.map((slot) => {
            const isEditing = editingId === slot.id;
            const isExpanded = expandedPeopleId === slot.id;

            return (
              <article
                key={slot.id}
                className="rounded-xl border border-white/10 bg-white/[0.06] p-3"
              >
                {isEditing && draft ? (
                  <div className="grid gap-2 md:grid-cols-[1fr_120px_100px_100px_110px_auto]">
                    <input
                      value={draft.topic}
                      onChange={(event) =>
                        updateDraft("topic", event.target.value)
                      }
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                      placeholder="内容"
                    />
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        updateDraft("date", event.target.value)
                      }
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                    />
                    <input
                      type="time"
                      value={draft.fromTime}
                      onChange={(event) =>
                        updateDraft("fromTime", event.target.value)
                      }
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                    />
                    <input
                      type="time"
                      value={draft.toTime}
                      onChange={(event) =>
                        updateDraft("toTime", event.target.value)
                      }
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                    />
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        updateDraft(
                          "status",
                          event.target.value as AdminSlot["status"],
                        )
                      }
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                    >
                      <option value="open">open</option>
                      <option value="booked">booked</option>
                      <option value="closed">closed</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveSlot(slot.id)}
                        disabled={savingId === slot.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-400 text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                        aria-label="Save slot"
                        title="Save"
                      >
                        <Save aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-100 transition hover:bg-white/10"
                        aria-label="Cancel editing"
                        title="Cancel"
                      >
                        <X aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-[minmax(160px,1fr)_120px_120px_90px_136px] lg:items-center">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-white">
                        {slot.topic}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-400 lg:hidden">
                        {slot.date} ・ {slot.timeRange}
                      </p>
                    </div>
                    <span className="hidden text-xs text-slate-300 lg:block">
                      {slot.date}
                    </span>
                    <span className="hidden items-center gap-1 text-xs text-slate-300 lg:flex">
                      <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                      {slot.timeRange}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-center text-xs font-semibold ${
                        slot.status === "open"
                          ? "bg-teal-400/15 text-teal-200"
                          : slot.status === "booked"
                            ? "bg-amber-300/15 text-amber-100"
                            : "bg-slate-500/20 text-slate-200"
                      }`}
                    >
                      {slot.status}
                    </span>
                    <div className="flex shrink-0 flex-nowrap justify-start gap-1.5 lg:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPeopleId(isExpanded ? null : slot.id)
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                        aria-expanded={isExpanded}
                        title="Booked people"
                      >
                        <Users aria-hidden="true" className="h-3.5 w-3.5" />
                        {slot.bookings.length}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditing(slot)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-100 transition hover:bg-white/10"
                        aria-label="Edit slot"
                        title="Edit"
                      >
                        <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSlot(slot)}
                        disabled={deletingId === slot.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-300/20 bg-red-400/10 text-red-100 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Delete slot"
                        title="Delete"
                      >
                        <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/60 p-3">
                    {slot.bookings.length > 0 ? (
                      <div className="space-y-2">
                        {slot.bookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="grid gap-1 text-xs text-slate-300 sm:grid-cols-[1fr_1fr_120px]"
                          >
                            <span className="font-semibold text-white">
                              {booking.studentName}
                            </span>
                            <span>{booking.studentEmail}</span>
                            <span>{booking.studentPhone || "-"}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        この予約枠にはまだ予約がありません。
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {slots.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-8 text-center text-sm text-slate-400">
              予約枠はまだありません。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
