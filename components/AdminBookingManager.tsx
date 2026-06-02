"use client";

import { useState } from "react";
import { CalendarCheck, Pencil, Save, Trash2, X } from "lucide-react";
import type { AdminBooking } from "@/lib/bookings";
import type { AdminSlot } from "@/lib/slots";

type AdminBookingManagerProps = {
  initialBookings: AdminBooking[];
  initialSlots: AdminSlot[];
  isDatabaseReady: boolean;
};

type EditableBooking = {
  comment: string;
  language: string;
  slotId: string;
  status: AdminBooking["status"];
  studentEmail: string;
  studentName: string;
  studentPhone: string;
};

type BookingResponse = {
  booking?: AdminBooking;
  error?: string;
};

const statusLabels: Record<AdminBooking["status"], string> = {
  cancelled: "キャンセル",
  confirmed: "確定",
  pending: "保留",
};

function toEditableBooking(booking: AdminBooking): EditableBooking {
  return {
    comment: booking.comment,
    language: booking.language,
    slotId: booking.slotId,
    status: booking.status,
    studentEmail: booking.studentEmail,
    studentName: booking.studentName,
    studentPhone: booking.studentPhone,
  };
}

async function readBookingResponse(response: Response): Promise<BookingResponse> {
  const text = await response.text();

  if (!text) {
    return {
      error: `Empty response from server (${response.status}).`,
    };
  }

  try {
    return JSON.parse(text) as BookingResponse;
  } catch {
    return {
      error: text,
    };
  }
}

export function AdminBookingManager({
  initialBookings,
  initialSlots,
  isDatabaseReady,
}: AdminBookingManagerProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableBooking | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startEditing(booking: AdminBooking) {
    setMessage(null);
    setEditingId(booking.id);
    setDraft(toEditableBooking(booking));
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft(null);
  }

  function updateDraft<Value extends keyof EditableBooking>(
    key: Value,
    value: EditableBooking[Value],
  ) {
    setDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, [key]: value } : currentDraft,
    );
  }

  async function saveBooking(bookingId: string) {
    if (!draft) {
      return;
    }

    setSavingId(bookingId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });
      const data = await readBookingResponse(response);

      if (!response.ok || !data.booking) {
        throw new Error(data.error || "Could not update booking.");
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === data.booking?.id ? data.booking : booking,
        ),
      );
      setEditingId(null);
      setDraft(null);
      setMessage("予約を更新しました。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update booking.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deleteBooking(bookingId: string) {
    const shouldDelete = window.confirm("この予約を削除しますか？");

    if (!shouldDelete) {
      return;
    }

    setDeletingId(bookingId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const data = await readBookingResponse(response);

      if (!response.ok && data.error) {
        throw new Error(data.error);
      }

      setBookings((currentBookings) =>
        currentBookings.filter((booking) => booking.id !== bookingId),
      );
      if (editingId === bookingId) {
        cancelEditing();
      }
      setMessage("予約を削除しました。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not delete booking.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarCheck
              aria-hidden="true"
              className="h-4 w-4 text-teal-300"
            />
            予約一覧
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            学生情報、予約枠、ステータス、コメントを管理できます。
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">
          {bookings.length}件
        </span>
      </div>

      {!isDatabaseReady && (
        <p className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
          データベースがまだ設定されていません。
        </p>
      )}

      {message && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-200">
          {message}
        </p>
      )}

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {bookings.map((booking) => {
          return (
            <article
              key={booking.id}
              className="flex min-h-48 flex-col rounded-xl border border-white/10 bg-white/[0.06] p-3 shadow-lg shadow-black/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-white">
                    {booking.studentName}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-300">
                    {booking.language === "en" ? "English" : "日本語"} ・{" "}
                    {new Date(booking.createdAt).toLocaleString("ja-JP")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    booking.status === "confirmed"
                      ? "bg-teal-400/15 text-teal-200"
                      : booking.status === "pending"
                        ? "bg-amber-300/15 text-amber-100"
                        : "bg-red-400/15 text-red-100"
                  }`}
                >
                  {statusLabels[booking.status]}
                </span>
              </div>

              <div className="mt-3 flex-1 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">予約枠</span>
                  <p className="mt-0.5 truncate font-semibold text-white">
                    {booking.slot.topic}
                  </p>
                  <p className="text-slate-300">
                    {booking.slot.date} {booking.slot.timeRange}
                  </p>
                </div>

                <div className="grid gap-1 text-slate-300">
                  <p className="truncate">
                    <span className="text-slate-500">メール:</span>{" "}
                    {booking.studentEmail}
                  </p>
                  <p>
                    <span className="text-slate-500">電話:</span>{" "}
                    {booking.studentPhone}
                  </p>
                </div>

                {booking.comment && (
                  <p className="line-clamp-2 rounded-lg bg-slate-950/45 px-2 py-1.5 leading-5 text-slate-300">
                    {booking.comment}
                  </p>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-2">
                <button
                  type="button"
                  onClick={() => startEditing(booking)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                  編集
                </button>

                <button
                  type="button"
                  onClick={() => deleteBooking(booking.id)}
                  disabled={deletingId === booking.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/20 bg-red-400/10 px-2.5 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                  {deletingId === booking.id ? "削除中..." : "削除"}
                </button>
              </div>
            </article>
          );
        })}

        {bookings.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-8 text-center text-sm text-slate-400">
            予約はまだありません。
          </div>
        )}
      </div>

      {editingId && draft && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-edit-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="booking-edit-title"
                  className="text-base font-semibold text-white"
                >
                  予約を編集
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  学生情報、予約枠、ステータス、コメントを更新できます。
                </p>
              </div>
              <button
                type="button"
                onClick={cancelEditing}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  名前
                </span>
                <input
                  value={draft.studentName}
                  onChange={(event) =>
                    updateDraft("studentName", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  メール
                </span>
                <input
                  type="email"
                  value={draft.studentEmail}
                  onChange={(event) =>
                    updateDraft("studentEmail", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  電話番号
                </span>
                <input
                  value={draft.studentPhone}
                  onChange={(event) =>
                    updateDraft("studentPhone", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  言語
                </span>
                <select
                  value={draft.language}
                  onChange={(event) =>
                    updateDraft("language", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  予約枠
                </span>
                <select
                  value={draft.slotId}
                  onChange={(event) =>
                    updateDraft("slotId", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                >
                  {initialSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.date} {slot.timeRange} ・ {slot.topic}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  ステータス
                </span>
                <select
                  value={draft.status}
                  onChange={(event) =>
                    updateDraft(
                      "status",
                      event.target.value as AdminBooking["status"],
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                >
                  <option value="confirmed">確定</option>
                  <option value="pending">保留</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  コメント
                </span>
                <textarea
                  value={draft.comment}
                  onChange={(event) =>
                    updateDraft("comment", event.target.value)
                  }
                  className="mt-1 min-h-24 w-full resize-y rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                  placeholder="管理用メモ"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                <X aria-hidden="true" className="h-4 w-4" />
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => saveBooking(editingId)}
                disabled={savingId === editingId}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                <Save aria-hidden="true" className="h-4 w-4" />
                {savingId === editingId ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
