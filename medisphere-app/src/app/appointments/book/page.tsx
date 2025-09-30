// app/appointments/book/page.tsx
import prisma from "../../../lib/prisma";
import DoctorPickerBooking from "../../../components/appointments/DoctorPickerBooking";

export const metadata = { title: "Book Appointment" };

// Server-side load all visible doctors (tweak filter to your needs)
export default async function BookAppointmentPage({
  searchParams,
}: { searchParams?: { doctorId?: string } }) {
  const preselectId = searchParams?.doctorId ?? "";

  const doctors = await prisma.doctor.findMany({
    // If you want only approved in prod, use: where: { status: "APPROVED" }
    select: {
      id: true,
      specialization: true,
      consultationFee: true,
      rating: true,
      totalRatings: true,
      user: { select: { name: true, image: true } },
    },
    orderBy: [{ rating: "desc" }, { totalRatings: "desc" }, { createdAt: "desc" }],
    take: 120,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
              Book Appointment
            </h1>
            <p className="text-cyan-800/70">
              Pick a doctor, select date & time, add notes, and confirm.
            </p>
          </div>
        </div>

        {/* Picker + Form */}
        <DoctorPickerBooking doctors={doctors} preselectId={preselectId} />
      </div>
    </div>
  );
}