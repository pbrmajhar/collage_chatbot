import {
  Bell,
  BookOpenText,
  CalendarCheck,
  Clock3,
  Settings,
  UserRound,
} from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { AdminToastProvider } from "@/components/AdminToastProvider";
import { SignOutButton } from "@/components/SignOutButton";
import { getUnreadBookingCount } from "@/lib/booking-notifications";

type AdminShellProps = {
  active:
    | "bookings"
    | "home"
    | "college-info"
    | "settings"
    | "time-slots"
    | "users";
  children: React.ReactNode;
  description: string;
  title: string;
};

const navItems = [
  {
    href: "/admin/college-info",
    icon: BookOpenText,
    id: "college-info",
    label: "学校情報",
  },
  {
    href: "/admin/time-slots",
    icon: Clock3,
    id: "time-slots",
    label: "予約枠",
  },
  {
    href: "/admin/bookings",
    icon: CalendarCheck,
    id: "bookings",
    label: "予約一覧",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    id: "settings",
    label: "設定",
  },
  {
    href: "/admin/users",
    icon: UserRound,
    id: "users",
    label: "ユーザー",
  },
] as const;

export async function AdminShell({
  active,
  children,
  description,
  title,
}: AdminShellProps) {
  noStore();
  const unreadBookingCount = await getUnreadBookingCount();

  return (
    <main className="h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div
        className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl shadow-black/30"
        style={{ backgroundColor: "var(--app-panel-bg)" }}
      >
        <header className="shrink-0 border-b border-white/10 bg-slate-950/70 px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {title}
              </h1>
              <p className="mt-1 text-sm text-slate-300">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/bookings"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-100 transition hover:bg-white/10"
                aria-label="新規予約"
                title="新規予約"
              >
                <Bell aria-hidden="true" className="h-4 w-4 text-teal-300" />
                {unreadBookingCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-400 px-1 text-[11px] font-bold text-white">
                    {unreadBookingCount > 99 ? "99+" : unreadBookingCount}
                  </span>
                )}
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>

        <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-white/10 px-5 py-3 sm:px-7">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-teal-300 bg-teal-400 text-slate-950"
                    : "border-white/10 bg-white/[0.06] text-slate-100 hover:bg-white/10"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-4 w-4 ${isActive ? "text-slate-950" : "text-teal-300"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <AdminToastProvider>{children}</AdminToastProvider>
      </div>
    </main>
  );
}
