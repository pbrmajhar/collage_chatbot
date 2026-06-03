"use client";

import { useState } from "react";
import { CalendarCheck, Pencil, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/AdminToastProvider";
import type { AdminBooking } from "@/lib/bookings";
import type { AdminSlot } from "@/lib/slots";

type AdminBookingManagerProps = {
  initialBookings: AdminBooking[];
  initialSlots: AdminSlot[];
  isDatabaseReady: boolean;
};

type EditableBooking = {
  comment: string;
  isRead: boolean;
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
    isRead: booking.isRead,
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
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [bookings, setBookings] = useState(initialBookings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableBooking | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const unreadBookingCount = bookings.filter((booking) => !booking.isRead).length;

  function startEditing(booking: AdminBooking) {
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
      showToast("予約を更新しました。");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "予約を更新できませんでした。",
        "error",
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
      showToast("予約を削除しました。");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "予約を削除できませんでした。",
        "error",
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
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">
            全{bookings.length}件
          </span>
          <span className="rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-100">
            未読{unreadBookingCount}件
          </span>
        </div>
      </div>

      {!isDatabaseReady && (
        <p className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
          データベースがまだ設定されていません。
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-900 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-3">状態</th>
                <th className="px-3 py-3">学生</th>
                <th className="px-3 py-3">予約枠</th>
                <th className="px-3 py-3">日時</th>
                <th className="px-3 py-3">連絡先</th>
                <th className="px-3 py-3">ステータス</th>
                <th className="px-3 py-3">コメント</th>
                <th className="px-3 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className={`transition hover:bg-white/[0.04] ${
                    booking.isRead ? "bg-transparent" : "bg-teal-400/[0.08]"
                  }`}
                >
                  <td className="whitespace-nowrap px-3 py-2 align-top">
                    {booking.isRead ? (
                      <span className="rounded-full bg-slate-500/20 px-2 py-1 font-semibold text-slate-300">
                        既読
                      </span>
                    ) : (
                      <span className="rounded-full bg-teal-400 px-2 py-1 font-bold text-slate-950">
                        未読
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <p className="max-w-36 truncate font-semibold text-white">
                      {booking.studentName}
                    </p>
                    <p className="mt-0.5 text-slate-400">
                      {booking.language === "en" ? "English" : "日本語"}
                    </p>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <p className="max-w-44 truncate font-semibold text-white">
                      {booking.slot.topic}
                    </p>
                    <p className="mt-0.5 text-slate-400">
                      {new Date(booking.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top text-slate-300">
                    <p>{booking.slot.date}</p>
                    <p className="mt-0.5">{booking.slot.timeRange}</p>
                  </td>
                  <td className="px-3 py-2 align-top text-slate-300">
                    <p className="max-w-44 truncate">{booking.studentEmail}</p>
                    <p className="mt-0.5">{booking.studentPhone}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top">
                    <span
                      className={`rounded-full px-2 py-1 font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-teal-400/15 text-teal-200"
                          : booking.status === "pending"
                            ? "bg-amber-300/15 text-amber-100"
                            : "bg-red-400/15 text-red-100"
                      }`}
                    >
                      {statusLabels[booking.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-slate-300">
                    <p className="line-clamp-2 max-w-44">
                      {booking.comment || "未入力"}
                    </p>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditing(booking)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-100 transition hover:bg-white/10"
                        aria-label="編集"
                        title="編集"
                      >
                        <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBooking(booking.id)}
                        disabled={deletingId === booking.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-300/20 bg-red-400/10 text-red-100 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="削除"
                        title="削除"
                      >
                        <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            予約はまだありません。
          </div>
        )}
      </div>

      {editingId && draft && (
        <div
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-h-[90vh] w-auto max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-edit-title"
        >
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

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  既読状態
                </span>
                <select
                  value={draft.isRead ? "read" : "unread"}
                  onChange={(event) =>
                    updateDraft("isRead", event.target.value === "read")
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/70"
                >
                  <option value="unread">未読</option>
                  <option value="read">既読</option>
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
      )}
    </section>
  );
}
