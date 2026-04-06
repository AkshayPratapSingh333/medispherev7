import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import DoctorProfile from "../../../components/doctors/DoctorProfile";

export default async function DoctorProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-cyan-800">
        Please sign in
      </div>
    );
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
  });

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
            <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-8 py-10 shadow text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                No doctor profile found
              </h1>
              <p className="mt-2 text-cyan-800/70">
                Complete your doctor registration to create your profile.
              </p>
              <Link
                href="/doctors/apply"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-white font-semibold hover:from-cyan-600 hover:to-emerald-600"
              >
                Apply / Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const doctorView = {
    id: doctor.id,
    user: doctor.user,
    specialization: doctor.specialization,
    experience: doctor.experience,
    qualification: doctor.qualification,
    hospitalName: doctor.hospitalName,
    consultationFee: doctor.consultationFee,
    bio: doctor.bio,
    rating: doctor.rating,
    totalRatings: doctor.totalRatings,
    languages: Array.isArray(doctor.languages)
      ? doctor.languages.filter((lang): lang is string => typeof lang === "string")
      : [],
    availableSchedule:
      doctor.availableSchedule && typeof doctor.availableSchedule === "object"
        ? (doctor.availableSchedule as Record<string, { from: string; to: string }[]>)
        : null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="relative">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                My Doctor Profile
              </h1>
              <p className="text-cyan-800/70">Review and manage your profile details.</p>
            </div>
            <Link
              href="/doctors/apply"
              className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
            >
              Edit Details
            </Link>
          </div>
        </div>

        <DoctorProfile doctor={doctorView} />
      </div>
    </div>
  );
}
