// app/patient/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

type PatientWithRelations = Prisma.PatientGetPayload<{
  include: { appointments: true; reports: true };
}>;

function fmt(d: Date) {
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toString();
  }
}

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-cyan-800">
        Please sign in
      </div>
    );
  }

  const patient: PatientWithRelations | null = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: { appointments: true, reports: true },
  });



 if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
            <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-8 py-10 shadow text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                Complete Your Patient Profile
              </h1>
              <p className="mt-2 text-cyan-800/70">
                Create your profile to book appointments and manage your health records.
              </p>
              <a
                href="/patient/register"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-white font-semibold hover:from-cyan-600 hover:to-emerald-600"
              >
                Register as Patient
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcoming = patient.appointments
    .filter(a => a.scheduledAt > new Date() && a.status !== "CANCELLED")
    .sort((a,b)=>a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const past = patient.appointments
    .filter(a => a.scheduledAt <= new Date())
    .sort((a,b)=>b.scheduledAt.getTime() - a.scheduledAt.getTime());

  return (
     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
              Patient Dashboard
            </h1>
            <p className="text-cyan-800/70">Welcome, {session.user.name ?? session.user.email}</p>

            <div className="mt-3 flex gap-2">
              <a
                href="/patient/profile"
                className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
              >
                View Profile
              </a>
              <a
                href="/patient/profile/edit"
                className="inline-flex items-center rounded-lg bg-emerald-600/10 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-600/15"
              >
                Edit Profile
              </a>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Stat label="Upcoming Appointments" value={upcoming.length} />
          <Stat label="Past Appointments" value={past.length} />
          <Stat label="Reports" value={patient.reports.length} />
        </div>

        {/* Two-column: upcoming & reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-cyan-900">Upcoming Appointments</h2>
              <a href="/appointments/book" className="text-cyan-700 hover:underline text-sm">Book new</a>
            </div>
            {upcoming.length === 0 ? (
              <Empty message="No upcoming appointments" hint="Book a slot that fits your schedule." />
            ) : (
              <ul className="divide-y divide-cyan-100/70">
                {upcoming.slice(0, 8).map(a => (
                  <li key={a.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-cyan-900">{fmt(a.scheduledAt)}</div>
                      <div className="text-sm text-cyan-700/70">Status: {a.status}</div>
                    </div>
                    <a
                      href={`/appointments/${a.id}`}
                      className="text-sm px-3 py-1.5 rounded-lg bg-cyan-600/10 text-cyan-700 ring-1 ring-cyan-200"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-cyan-900 mb-2">Recent Past</h3>
              {past.length === 0 ? (
                <p className="text-sm text-cyan-700/70">No past appointments.</p>
              ) : (
                <ul className="grid md:grid-cols-2 gap-3">
                  {past.slice(0, 4).map(a => (
                    <li key={a.id} className="p-3 rounded-xl border border-cyan-100">
                      <div className="text-cyan-900 font-medium">{fmt(a.scheduledAt)}</div>
                      <div className="text-sm text-cyan-700/70">Status: {a.status}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-cyan-900">Reports</h2>
              <a href="/reports" className="text-cyan-700 hover:underline text-sm">View all</a>
            </div>
            {patient.reports.length === 0 ? (
              <Empty message="No reports uploaded" hint="Your diagnostic reports will appear here." />
            ) : (
              <ul className="space-y-3">
                {patient.reports.slice(0, 6).map(r => (
                  <li key={r.id} className="p-3 rounded-xl border border-cyan-100">
                    <div className="font-medium text-cyan-900">{r.fileName}</div>
                    {"createdAt" in r && r.createdAt ? (
                      <div className="text-xs text-cyan-700/60 mt-0.5">
                        Uploaded {fmt(r.createdAt as unknown as Date)}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            <a
              href="/reports/upload"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-white font-medium hover:from-cyan-600 hover:to-emerald-600"
            >
              Upload Report
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-cyan-100 p-5 shadow-sm">
      <div className="text-sm text-cyan-700/70">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-cyan-800">{value}</div>
    </div>
  );
}

function Empty({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-cyan-100 p-6 text-center">
      <div className="text-cyan-800 font-medium">{message}</div>
      {hint && <div className="text-sm text-cyan-700/70">{hint}</div>}
    </div>
  );
}
