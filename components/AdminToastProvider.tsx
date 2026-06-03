"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastVariant = "error" | "success";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type AdminToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<AdminToastContextValue>(
    () => ({
      showToast(message, variant = "success") {
        const id = Date.now();
        setToasts((currentToasts) => [
          ...currentToasts,
          {
            id,
            message,
            variant,
          },
        ]);
      },
    }),
    [],
  );

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.slice(1));
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [toasts]);

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = toast.variant === "success" ? CheckCircle2 : XCircle;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-2xl shadow-black/30 ${
                toast.variant === "success"
                  ? "border-teal-300/25 bg-slate-950 text-teal-50"
                  : "border-red-300/25 bg-slate-950 text-red-50"
              }`}
            >
              <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{toast.message}</p>
            </div>
          );
        })}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);

  if (!context) {
    throw new Error("useAdminToast must be used inside AdminToastProvider.");
  }

  return context;
}
