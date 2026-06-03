import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="flex h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-6">
          <p className="text-sm font-medium text-teal-300">
            愛和システムエンジニア専門学校
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            管理者ログイン
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            予約枠、予約情報、学校情報を管理するためにログインしてください。
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
