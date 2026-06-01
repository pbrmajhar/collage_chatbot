"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarPlus, Clock, Plus, UserRoundCheck } from "lucide-react";
import type { AdminSlot } from "@/lib/slots";

type AdminSlotManagerProps = {
  initialSlots: AdminSlot[];
  isDatabaseReady: boolean;
};

export function AdminSlotManager({
  initialSlots,
  isDatabaseReady,
}: AdminSlotManagerProps) {
  const [slots, setSlots] = useState<AdminSlot[]>(initialSlots);
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [topic, setTopic] = useState("");
  const [toTime, setToTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openSlots = useMemo(
    () => slots.filter((slot) => slot.status === "open"),
    [slots],
  );

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
      const data = (await response.json()) as {
        error?: string;
        slot?: AdminSlot;
      };

      if (!response.ok || !data.slot) {
        throw new Error(data.error || "Could not create slot.");
      }

      const createdSlot = data.slot;
      setSlots((currentSlots) => [...currentSlots, createdSlot]);
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

  async function toggleStatus(slotToUpdate: AdminSlot) {
    const nextStatus = slotToUpdate.status === "open" ? "booked" : "open";
    setError(null);

    try {
      const response = await fetch(`/api/admin/slots/${slotToUpdate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await response.json()) as {
        error?: string;
        slot?: AdminSlot;
      };

      if (!response.ok || !data.slot) {
        throw new Error(data.error || "Could not update slot.");
      }

      const updatedSlot = data.slot;
      setSlots((currentSlots) =>
        currentSlots.map((slot) =>
          slot.id === updatedSlot.id ? updatedSlot : slot,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update slot.",
      );
    }
  }

  return (
    <section className="px-5 py-5 sm:px-7">
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
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
              データベースがまだ設定されていません.
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          )}
        </form>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1fr_90px] bg-slate-900/90 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid-cols-[1fr_130px_130px_100px]">
              <span>内容</span>
              <span className="hidden sm:block">日付</span>
              <span className="hidden sm:block">時間</span>
              <span>ステータス</span>
            </div>

            <div className="divide-y divide-white/10">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleStatus(slot)}
                  className="grid w-full grid-cols-[1fr_90px] items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/[0.04] sm:grid-cols-[1fr_130px_130px_100px]"
                >
                  <span className="text-white">{slot.topic}</span>
                  <span className="hidden text-slate-300 sm:block">
                    {slot.date}
                  </span>
                  <span className="hidden items-center gap-1 text-slate-300 sm:flex">
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
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
