"use client";

import { FormEvent, useState } from "react";
import { Edit3, Plus, Save, Trash2, UserRound, X } from "lucide-react";
import { useAdminToast } from "@/components/AdminToastProvider";
import type { SafeAdminUser } from "@/lib/admin-users";

type AdminUserManagerProps = {
  currentAdminEmail?: string | null;
  initialUsers: SafeAdminUser[];
  isDatabaseReady: boolean;
};

type UserResponse = {
  error?: string;
  user?: SafeAdminUser;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function readUserResponse(response: Response): Promise<UserResponse> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as UserResponse;
  } catch {
    return {
      error: text,
    };
  }
}

export function AdminUserManager({
  currentAdminEmail,
  initialUsers,
  isDatabaseReady,
}: AdminUserManagerProps) {
  const { showToast } = useAdminToast();
  const [users, setUsers] = useState(initialUsers);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [editingUser, setEditingUser] = useState<SafeAdminUser | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openEditModal(user: SafeAdminUser) {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditName(user.name);
    setEditPassword("");
    setEditIsActive(user.isActive);
  }

  function closeEditModal() {
    setEditingUser(null);
    setEditEmail("");
    setEditName("");
    setEditPassword("");
    setEditIsActive(true);
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createEmail,
          name: createName,
          password: createPassword,
        }),
      });
      const data = await readUserResponse(response);

      if (!response.ok || !data.user) {
        throw new Error(data.error || "ユーザーを作成できませんでした。");
      }

      setUsers((currentUsers) => [...currentUsers, data.user!]);
      setCreateEmail("");
      setCreateName("");
      setCreatePassword("");
      showToast("ユーザーを追加しました。");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "ユーザーを作成できませんでした。",
        "error",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function updateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: editEmail,
          isActive: editIsActive,
          name: editName,
          password: editPassword,
        }),
      });
      const data = await readUserResponse(response);

      if (!response.ok || !data.user) {
        throw new Error(data.error || "ユーザーを更新できませんでした。");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === data.user!.id ? data.user! : user,
        ),
      );
      closeEditModal();
      showToast("ユーザーを更新しました。");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "ユーザーを更新できませんでした。",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteUser(user: SafeAdminUser) {
    const confirmed = window.confirm(
      `${user.name} を削除しますか？この操作は元に戻せません。`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(user.id);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await readUserResponse(response);
        throw new Error(data.error || "ユーザーを削除できませんでした。");
      }

      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );
      showToast("ユーザーを削除しました。");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "ユーザーを削除できませんでした。",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <UserRound aria-hidden="true" className="h-4 w-4 text-teal-300" />
        管理ユーザー
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <form
          onSubmit={createUser}
          className="h-fit rounded-2xl border border-white/10 bg-white/[0.06] p-4"
        >
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                名前
              </span>
              <input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="管理者名"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                メールアドレス
              </span>
              <input
                type="email"
                value={createEmail}
                onChange={(event) => setCreateEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="admin@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                パスワード
              </span>
              <input
                type="password"
                value={createPassword}
                onChange={(event) => setCreatePassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="8文字以上"
                required
                minLength={8}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!isDatabaseReady || isCreating}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            {isCreating ? "追加中..." : "ユーザーを追加"}
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">ユーザー</th>
                  <th className="px-4 py-3">状態</th>
                  <th className="px-4 py-3">作成日</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-300" colSpan={4}>
                      管理ユーザーはまだ登録されていません。
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isCurrentUser =
                      currentAdminEmail?.toLowerCase() ===
                      user.email.toLowerCase();

                    return (
                      <tr key={user.id} className="text-slate-100">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">
                            {user.name}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {user.email}
                            {isCurrentUser ? " ・ログイン中" : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              user.isActive
                                ? "bg-teal-400/15 text-teal-100"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {user.isActive ? "有効" : "無効"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-300">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-100 transition hover:bg-white/10"
                              title="編集"
                              aria-label="編集"
                            >
                              <Edit3
                                aria-hidden="true"
                                className="h-4 w-4 text-teal-300"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteUser(user)}
                              disabled={deletingId === user.id || isCurrentUser}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300/20 bg-red-400/10 text-red-100 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-45"
                              title="削除"
                              aria-label="削除"
                            >
                              <Trash2 aria-hidden="true" className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed right-4 top-24 z-50 w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">
              ユーザー編集
            </h2>
            <button
              type="button"
              onClick={closeEditModal}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-100 transition hover:bg-white/10"
              aria-label="閉じる"
              title="閉じる"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={updateUser} className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                名前
              </span>
              <input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                メールアドレス
              </span>
              <input
                type="email"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                新しいパスワード
              </span>
              <input
                type="password"
                value={editPassword}
                onChange={(event) => setEditPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/70"
                placeholder="変更しない場合は空欄"
                minLength={editPassword ? 8 : undefined}
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(event) => setEditIsActive(event.target.checked)}
              />
              有効なユーザー
            </label>

            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {isUpdating ? "保存中..." : "保存"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
