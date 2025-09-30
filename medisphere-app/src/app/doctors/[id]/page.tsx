import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import DoctorProfile from "../../../components/doctors/DoctorProfile";

type Params = { params: { id: string } };

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

  // DoctorProfile expects these fields; adjust if your shape differs
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <DoctorProfile doctor={doctor as any} />
      </div>
    </div>
  );
}
