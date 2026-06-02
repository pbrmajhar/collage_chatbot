"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarCheck, RefreshCw, X } from "lucide-react";
import type { Language } from "@/components/language";
import type { AdminSlot } from "@/lib/slots";

type BookingPanelProps = {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

type SlotsResponse = {
  slots?: AdminSlot[];
};

type BookingResponse = {
  error?: string;
  slot?: AdminSlot;
};

const copy = {
  ja: {
    title: "予約できる時間",
    empty: "現在、予約できる時間はありません。",
    name: "名前",
    email: "メール",
    phone: "電話番号",
    submit: "予約する",
    saving: "予約中...",
    success: "予約が完了しました。",
    refresh: "更新",
    error: "予約できませんでした。",
  },
  en: {
    title: "Available times",
    empty: "No available booking times right now.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    submit: "Book selected time",
    saving: "Booking...",
    success: "Booking confirmed.",
    refresh: "Refresh",
    error: "Could not create booking.",
  },
} satisfies Record<Language, Record<string, string>>;

export function BookingPanel({
  isOpen,
  language,
  onClose,
  onSuccess,
}: BookingPanelProps) {
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const text = copy[language];

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId),
    [selectedSlotId, slots],
  );

  async function loadSlots() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/slots");
      const data = (await response.json()) as SlotsResponse;
      const nextSlots = data.slots ?? [];

      setSlots(nextSlots);
      setSelectedSlotId((current) =>
        nextSlots.some((slot) => slot.id === current)
          ? current
          : (nextSlots[0]?.id ?? ""),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      void loadSlots();
    }
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !selectedSlotId ||
      !studentName.trim() ||
      !studentEmail.trim() ||
      !studentPhone.trim()
    ) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          slotId: selectedSlotId,
          studentEmail,
          studentName,
          studentPhone,
        }),
      });
      const data = (await response.json()) as BookingResponse;

      if (!response.ok) {
        throw new Error(data.error || text.error);
      }

      const successMessage = `${text.success} ${selectedSlot?.topic ?? ""} ${selectedSlot?.date ?? ""} ${selectedSlot?.timeRange ?? ""}`;
      setStudentName("");
      setStudentEmail("");
      setStudentPhone("");
      setMessage(null);
      onSuccess(successMessage);
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/55 px-4 py-4 backdrop-blur-sm transition sm:items-center ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarCheck aria-hidden="true" className="h-4 w-4 text-teal-300" />
            {text.title}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadSlots()}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              {text.refresh}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {slots.length === 0 ? (
          <p className="text-sm text-slate-400">{text.empty}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-left text-xs transition ${
                    selectedSlotId === slot.id
                      ? "border-teal-300 bg-teal-400 text-slate-950"
                      : "border-white/10 bg-slate-900 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <span className="mt-1 block max-w-36 truncate font-semibold">
                    {slot.topic}
                  </span>
                  <span className="block">{slot.date}</span>
                  <span>{slot.timeRange}</span>
                </button>
              ))}
            </div>

            {selectedSlot && (
              <div className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                <span className="font-semibold text-white">
                  {selectedSlot.topic}
                </span>
                <span className="ml-2 text-slate-400">
                  {selectedSlot.date} {selectedSlot.timeRange}
                </span>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-3">
              <input
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder={text.name}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                required
              />
              <input
                type="email"
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                placeholder={text.email}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                required
              />
              <input
                value={studentPhone}
                onChange={(event) => setStudentPhone(event.target.value)}
                placeholder={text.phone}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || !selectedSlotId}
              className="w-full rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isSaving ? text.saving : text.submit}
            </button>
          </form>
        )}

        {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
      </div>
    </div>
  );
}
