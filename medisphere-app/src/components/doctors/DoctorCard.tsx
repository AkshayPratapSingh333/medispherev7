// components/doctors/DoctorCard.tsx
"use client";

import Link from "next/link";

export default function DoctorCard({ doctor }: { doctor: any }) {
  return (
    <div className="border rounded p-4 shadow-sm">
      <h3 className="font-semibold">{doctor.user.name}</h3>
      <p className="text-sm text-gray-600">{doctor.specialization}</p>
      <p className="text-sm">Experience: {doctor.experience} years</p>
      <p className="text-sm">Fee: ₹{doctor.consultationFee}</p>
      <Link
        href={`/doctors/${doctor.id}`}
        className="text-blue-600 text-sm underline mt-2 block"
      >
        View profile
      </Link>
    </div>
  );
}
