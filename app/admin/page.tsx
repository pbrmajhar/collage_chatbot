import {
  ArrowRight,
  AlertTriangle,
  BookOpenText,
  CalendarCheck,
  Clock3,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AiServiceNoticeDismissButton } from "@/components/AiServiceNoticeDismissButton";
import { AdminShell } from "@/components/AdminShell";
import { getAdminSettings } from "@/lib/admin-settings";
import { getAiServiceNotice } from "@/lib/ai-service-status";

const adminCards = [
  {
    description: "ボットが使う日本語・英語の学校情報を追加・編集します。",
    href: "/admin/college-info",
    icon: BookOpenText,
    title: "学校情報",
  },
  {
    description: "予約できる日時と開始・終了時間を作成します。",
    href: "/admin/time-slots",
    icon: Clock3,
    title: "予約枠",
  },
  {
    description: "学生の予約を確認・編集・コメント・削除します。",
    href: "/admin/bookings",
    icon: CalendarCheck,
    title: "予約一覧",
  },
  {
    description: "管理画面のタイトル、サブタイトル、表示設定を変更します。",
    href: "/admin/settings",
    icon: Settings,
    title: "設定",
  },
  {
    description: "管理者ログイン用のユーザーを追加・編集します。",
    href: "/admin/users",
    icon: UserRound,
    title: "ユーザー管理",
  },
];

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  const settings = await getAdminSettings();
  const aiServiceNotice = await getAiServiceNotice();

  return (
    <AdminShell
      active="home"
      title={settings.title}
      description={settings.subtitle}
    >
      <section className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
        {aiServiceNotice && (
          <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-50">
            <div className="flex items-start gap-3">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-200"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold">
                  AIサービスの確認が必要です
                </h2>
                <p className="mt-1 text-sm text-amber-100">
                  {aiServiceNotice.message}
                </p>
                <p className="mt-2 text-xs text-amber-100/80">
                  検出日時:{" "}
                  {new Date(aiServiceNotice.createdAt).toLocaleString("ja-JP")}
                </p>
              </div>
              <AiServiceNoticeDismissButton />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {adminCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400 text-slate-950">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-white"
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
