// app/patient/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import PatientProfile from "../../../components/patients/PatientProfile";

export default async function PatientProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="min-h-[50vh] grid place-items-center text-cyan-800">Please sign in</div>;
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!patient) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="relative">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                My Profile
              </h1>
              <p className="text-cyan-800/70">Review your details below.</p>
            </div>
            <a
              href="/patient/profile/edit"
              className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
            >
              Edit Profile
            </a>
          </div>
        </div>

        <PatientProfile patient={patient as any} />
      </div>
    </div>
  );
}