// components/appointments/DoctorPickerBooking.tsx
"use client";

import { useMemo, useState } from "react";
import AppointmentBookingForm from "../forms/AppointmentBookingForm";

type DoctorLite = {
  id: string;
  specialization: string;
  consultationFee: number | null;
  rating: number | null;
  totalRatings: number | null;
  user: { name: string | null; image: string | null } | null;
};

function inr(n?: number | null) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
  } catch {
    return `₹${n.toFixed(2)}`;
  }
}

export default function DoctorPickerBooking({
  doctors,
  preselectId,
}: {
  doctors: DoctorLite[];
  preselectId?: string;
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(() => {
    if (!preselectId) return null;
    return doctors.some(d => d.id === preselectId) ? preselectId : null;
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter(d => {
      const name = d.user?.name?.toLowerCase() ?? "";
      const spec = d.specialization.toLowerCase();
      return name.includes(term) || spec.includes(term);
    });
  }, [q, doctors]);

  const doc = useMemo(() => doctors.find(d => d.id === selected) || null, [selected, doctors]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: doctor list & search */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search + count */}
        <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or specialization…"
              className="flex-1 rounded-lg border border-cyan-200/70 bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 placeholder:text-cyan-600/50"
            />
            <span className="text-sm text-cyan-700/70">{filtered.length} found</span>
          </div>
        </div>

        {/* Doctors grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-cyan-100 bg-white p-8 text-center text-cyan-800">
            No doctors match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((d) => {
              const active = selected === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={[
                    "text-left group rounded-2xl border p-4 shadow-sm transition-all",
                    active
                      ? "border-emerald-300 bg-emerald-50/60"
                      : "border-cyan-100 bg-white hover:shadow-md",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-200 to-emerald-200 ring-1 ring-cyan-200 overflow-hidden" />
                    <div className="min-w-0">
                      <div className="font-semibold text-cyan-900 truncate">
                        {d.user?.name ? `Dr. ${d.user.name}` : "Doctor"}
                      </div>
                      <div className="text-sm text-cyan-800/80 truncate">{d.specialization}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="rounded-md bg-emerald-600/10 px-2 py-0.5 text-emerald-800 ring-1 ring-emerald-200">
                          {inr(d.consultationFee)}
                        </span>
                        <span className="text-amber-600">
                          ⭐ {Number(d.rating ?? 0).toFixed(1)}
                          <span className="text-cyan-700/60"> ({d.totalRatings ?? 0})</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  {active && (
                    <div className="mt-3 text-xs text-emerald-800">
                      Selected • proceed to choose date & time →
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: booking form for selected doctor */}
      <div className="lg:col-span-1">
        {!doc ? (
          <div className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
            <div className="text-cyan-900 font-semibold mb-1">Select a doctor</div>
            <p className="text-sm text-cyan-800/80">
              Pick a doctor from the list to continue booking.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
              <div className="font-semibold text-cyan-900">Booking with</div>
              <div className="mt-0.5 text-cyan-900">
                Dr. {doc.user?.name ?? "Doctor"}
              </div>
              <div className="text-sm text-cyan-800/80">{doc.specialization}</div>
              <div className="mt-1 text-sm text-cyan-800/80">{inr(doc.consultationFee)}</div>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
              <AppointmentBookingForm doctorId={doc.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
