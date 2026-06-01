import { ArrowRight, BookOpenText, Clock3, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/AdminShell";
import { getAdminSettings } from "@/lib/admin-settings";

const adminCards = [
  {
    description: "Add and edit Japanese or English information for the bot.",
    href: "/admin/college-info",
    icon: BookOpenText,
    title: "College Info",
  },
  {
    description: "Create booking times with from and to time ranges.",
    href: "/admin/time-slots",
    icon: Clock3,
    title: "Time Slots",
  },
  {
    description: "Change the admin panel title and subtitle.",
    href: "/admin/settings",
    icon: Settings,
    title: "Settings",
  },
];

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  const settings = await getAdminSettings();

  return (
    <AdminShell
      active="home"
      title={settings.title}
      description={settings.subtitle}
    >
      <section className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
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
