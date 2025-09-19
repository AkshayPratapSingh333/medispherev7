"use client";
import useSWR from "swr";

export default function UserManagement() {
  const { data, error } = useSWR("/api/admin/stats", (url) => fetch(url).then((r) => r.json()));
  if (error) return <p>Error loading users</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">User Management (placeholder)</h2>
      <p>Total users: {data.users}</p>
    </div>
  );
}
