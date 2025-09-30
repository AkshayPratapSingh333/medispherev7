// components/doctors/DoctorCard.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Doctor = {
  id: string;
  user?: { name?: string | null; image?: string | null } | null;
  specialization: string;
  experience: number;
  consultationFee: number;
  hospitalName?: string | null;
  languages?: string[] | null;
  rating?: number | null;
  totalRatings?: number | null;
};

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  const {
    id, user, specialization, experience, consultationFee,
    hospitalName, languages = [], rating = 0, totalRatings = 0,
  } = doctor;

  const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group rounded-2xl border border-cyan-100 bg-white shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-5 flex gap-4">
        <div className="shrink-0">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-cyan-200 to-emerald-200 ring-1 ring-cyan-200 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {user?.image ? <img src={user.image} alt={user?.name ?? "Doctor"} className="h-full w-full object-cover" /> : null}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-cyan-900 font-semibold truncate">{user?.name ?? "Doctor"}</h3>
          <p className="text-sm text-cyan-700/80 truncate">{specialization}</p>
          {hospitalName && <p className="text-xs text-cyan-700/70 truncate mt-0.5">{hospitalName}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-cyan-800 ring-1 ring-cyan-200">
              {experience} yrs
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800 ring-1 ring-emerald-200">
              {inr(consultationFee)}
            </span>
            <span className="ml-auto text-amber-600">
              ⭐ {Number(rating ?? 0).toFixed(1)}
              <span className="text-cyan-700/60"> ({totalRatings})</span>
            </span>
          </div>

          {languages?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {languages.slice(0, 4).map((l, i) => (
                <span key={i} className="rounded-lg bg-white px-2 py-0.5 text-xs text-cyan-800 ring-1 ring-cyan-200">
                  {l}
                </span>
              ))}
              {languages.length > 4 && (
                <span className="text-xs text-cyan-700/70">+{languages.length - 4} more</span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-5 pb-5">
        <Link
          href={`/doctors/${id}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-white font-medium hover:from-cyan-600 hover:to-emerald-600"
        >
          View Profile
        </Link>
      </div>
      <div className="px-5 pb-5">
        <Link
  href={`/appointments/book?doctorId=${doctor.id}`}
  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-white font-medium hover:from-cyan-600 hover:to-emerald-600"
>
  Book Appointment
</Link>
      </div>
    </motion.div>
  );
}
