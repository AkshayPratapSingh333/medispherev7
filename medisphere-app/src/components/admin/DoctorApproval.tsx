"use client";
import useSWR from "swr";

export default function DoctorApproval() {
  const { data, mutate } = useSWR("/api/admin/doctors/pending", (url) => fetch(url).then((r) => r.json()));

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/doctors/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  }

  if (!data) return <p>Loading pending doctors…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Pending Doctor Applications</h2>
      {data.length === 0 && <p>No pending applications.</p>}
      <ul className="space-y-2">
        {data.map((doc: any) => (
          <li key={doc.id} className="border p-3 rounded flex justify-between">
            <span>{doc.user.name} — {doc.specialization}</span>
            <div className="space-x-2">
              <button onClick={() => updateStatus(doc.id, "APPROVED")} className="bg-green-600 text-white px-2 py-1 rounded">
                Approve
              </button>
              <button onClick={() => updateStatus(doc.id, "REJECTED")} className="bg-red-600 text-white px-2 py-1 rounded">
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
