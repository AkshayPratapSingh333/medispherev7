import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import DoctorProfile from "../../../components/doctors/DoctorProfile";

type Params = { params: { id: string } };

type DoctorProfileData = {
  id: string;
  user: { name?: string | null; image?: string | null; email?: string | null };
  specialization: string;
  experience: number;
  qualification: string;
  hospitalName?: string | null;
  consultationFee: number;
  bio?: string | null;
  languages?: string[] | null;
  rating?: number | null;
  totalRatings?: number | null;
  availableSchedule?: Record<string, { from: string; to: string }[]> | null;
};

function toStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const arr = value.filter((v): v is string => typeof v === "string");
  return arr.length ? arr : null;
}

function toSchedule(
  value: unknown
): Record<string, { from: string; to: string }[]> | null {
  if (!value || typeof value !== "object") return null;

  const result: Record<string, { from: string; to: string }[]> = {};

  for (const [day, slots] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(slots)) continue;
    const parsedSlots = slots
      .filter((slot): slot is { from: string; to: string } => {
        if (!slot || typeof slot !== "object") return false;
        const s = slot as Record<string, unknown>;
        return typeof s.from === "string" && typeof s.to === "string";
      })
      .map((slot) => ({ from: slot.from, to: slot.to }));

    result[day] = parsedSlots;
  }

  return Object.keys(result).length ? result : null;
}

export async function generateMetadata({ params }: Params) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: params.id },
    select: { user: { select: { name: true } }, specialization: true },
  });
  const name = doctor?.user?.name ?? "Doctor";
  return {
    title: `${name} – Profile`,
    description: `${name} | ${doctor?.specialization ?? "Specialist"}`,
  };
}

export default async function DoctorProfilePage({ params }: Params) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: params.id }, // <-- make sure your link uses Doctor.id, not userId
    include: {
      user: { select: { name: true, image: true, email: true } },
      // include anything else you need
    },
  });

  if (!doctor) {
    notFound();
  }

  const doctorForProfile: DoctorProfileData = {
    id: doctor.id,
    user: doctor.user,
    specialization: doctor.specialization,
    experience: doctor.experience,
    qualification: doctor.qualification,
    hospitalName: doctor.hospitalName,
    consultationFee: doctor.consultationFee,
    bio: doctor.bio,
    languages: toStringArray(doctor.languages),
    rating: doctor.rating,
    totalRatings: doctor.totalRatings,
    availableSchedule: toSchedule(doctor.availableSchedule),
  };

  // DoctorProfile expects these fields; adjust if your shape differs
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <DoctorProfile doctor={doctorForProfile} />
      </div>
    </div>
  );
}
