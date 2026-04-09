"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";

type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
  doctor: { id: string; status: string; specialization: string } | null;
  patient: { id: string } | null;
};

type UsersResponse = {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  users: AdminUser[];
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error || "Failed to load users");
  }
  return (await res.json()) as UsersResponse;
};

export default function UserManagement() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [page, setPage] = useState(1);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (role !== "ALL") p.set("role", role);
    p.set("page", String(page));
    p.set("pageSize", "10");
    return `/api/admin/users?${p.toString()}`;
  }, [q, role, page]);

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
  });

  async function updateRole(userId: string, newRole: UserRole) {
    setSavingUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j?.error || "Failed to update role");
      }

      toast.success("User role updated.");
      mutate();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update role";
      toast.error(message);
    } finally {
      setSavingUserId(null);
    }
  }

  async function deleteUser(userId: string, role: UserRole, email: string) {
    if (!(role === "DOCTOR" || role === "PATIENT")) {
      toast.error("Only doctor and patient accounts can be deleted here.");
      return;
    }

    const confirmed = window.confirm(`Delete ${role.toLowerCase()} account for ${email}? This action cannot be undone.`);
    if (!confirmed) return;

    setSavingUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j?.error || "Failed to delete user");
      }

      toast.success("User deleted.");
      mutate();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete user";
      toast.error(message);
    } finally {
      setSavingUserId(null);
    }
  }

  if (error) {
    return <p className="text-sm text-rose-700">{error.message}</p>;
  }

  const users = data?.users || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Total: {total}</span>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
          className="rounded-lg border border-emerald-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 md:col-span-3"
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as "ALL" | UserRole);
            setPage(1);
          }}
          className="rounded-lg border border-emerald-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="DOCTOR">DOCTOR</option>
          <option value="PATIENT">PATIENT</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Current Role</th>
              <th className="px-3 py-2 font-medium">Profile</th>
              <th className="px-3 py-2 font-medium">Joined</th>
              <th className="px-3 py-2 font-medium">Change Role</th>
                <th className="px-3 py-2 font-medium">Delete</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={7}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={7}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-slate-900">{u.name || "Unknown"}</td>
                  <td className="px-3 py-2 text-slate-700">{u.email}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{u.role}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {u.doctor ? `Doctor (${u.doctor.status})` : u.patient ? "Patient" : "General"}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={u.role}
                        className="rounded border border-emerald-200 px-2 py-1 text-xs"
                        onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                        disabled={savingUserId === u.id}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="DOCTOR">DOCTOR</option>
                        <option value="PATIENT">PATIENT</option>
                      </select>
                      {savingUserId === u.id && <span className="text-xs text-slate-500">Saving...</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => deleteUser(u.id, u.role, u.email)}
                      disabled={savingUserId === u.id || !(u.role === "DOCTOR" || u.role === "PATIENT")}
                      className="rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border border-slate-200 px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="rounded border border-slate-200 px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
