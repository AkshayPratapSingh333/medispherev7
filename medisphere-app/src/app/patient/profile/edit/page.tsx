// app/patient/profile/edit/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";
import ProfileUpdateForm from "../../../../components/forms/ProfileUpdateForm";

function toDateInputValue(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default async function PatientProfileEditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="min-h-[50vh] grid place-items-center text-cyan-800">Please sign in</div>;
  }

  const p = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!p) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-cyan-800">No patient profile found</h1>
          <a href="/patient/register" className="mt-3 inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white">
            Register as Patient
          </a>
        </div>
      </div>
    );
  }

  const dto = {
    id: p.id,
    dateOfBirth: toDateInputValue(p.dateOfBirth),
    gender: p.gender ?? "",
    phoneNumber: p.phoneNumber ?? "",
    emergencyContact: p.emergencyContact ?? "",
    medicalHistory: p.medicalHistory ?? "",
    allergies: p.allergies ?? "",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
              Edit Profile
            </h1>
            <p className="text-cyan-800/70">Update your personal details and medical info.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm">
          <ProfileUpdateForm patient={dto as any} />
        </div>
      </div>
    </div>
  );
}
