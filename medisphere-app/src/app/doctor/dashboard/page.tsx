import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";

type DoctorWithRelations = Prisma.DoctorGetPayload<{
  include: {
    user: { select: { name: true; email: true; image: true } };
    appointments: {
      select: { id: true; scheduledAt: true; status: true; patient: { select: { user: { select: { name: true } } } } };
      orderBy: { scheduledAt: "asc" };
      where: { scheduledAt: { gt: Date }; NOT: { status: "CANCELLED" } };
      take: number;
    };
    _count: { select: { reviews: true } };
  };
}>;

function fmt(d: Date) {
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toString();
  }
}

function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "emerald" | "amber" }) {
  const tones = {
    cyan: "bg-cyan-600/10 text-cyan-800 ring-cyan-200",
    emerald: "bg-emerald-600/10 text-emerald-800 ring-emerald-200",
    amber: "bg-amber-600/10 text-amber-800 ring-amber-200",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ring-1 ${tones[tone]}`}>{children}</span>
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

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);

  // Guard: must be signed in
  if (!session?.user?.id) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-cyan-800">
        Please sign in.
      </div>
    );
  }

  // Fetch doctor tied to this user
  const now = new Date();
  const doctor: DoctorWithRelations | null = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      // Next 8 upcoming non-cancelled appointments
      appointments: {
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          patient: { select: { user: { select: { name: true } } } },
        },
        where: { scheduledAt: { gt: now }, NOT: { status: "CANCELLED" } },
        orderBy: { scheduledAt: "asc" },
        take: 8,
      },
      _count: { select: { reviews: true } },
    },
  });

  // If no doctor record, show apply/register CTA
  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
            <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-8 py-10 shadow text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                Become a Doctor on the Platform
              </h1>
              <p className="mt-2 text-cyan-800/70">
                Submit your credentials to start receiving appointments.
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

  const rating = Number(doctor?.rating ?? 0);
  const totalReviews = doctor?._count.reviews ?? 0;
  const upcomingCount = doctor.appointments.length;

  // Tone for status
  const statusTone =
    doctor.status === "APPROVED" ? "emerald" : doctor.status === "PENDING" ? "amber" : "cyan";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header card */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                  Doctor Dashboard
                </h1>
                <p className="text-cyan-800/70">
                  Welcome, {doctor.user.name ?? session.user.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone as any}>Status: {doctor.status}</Badge>
                  {doctor.specialization ? (
                    <Badge>Specialization: {doctor.specialization}</Badge>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/doctor/profile"
                  className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/appointments/upcoming"
                  className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
                >
                  View all upcoming
                </Link>
                <Link
                  href="/appointments"
                  className="inline-flex items-center rounded-lg bg-emerald-600/10 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-600/15"
                >
                  Manage appointments
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Stat label="Upcoming Appointments" value={upcomingCount} />
          <Stat label="Rating" value={`${rating.toFixed(1)} ⭐`} />
          <Stat label="Total Reviews" value={totalReviews} />
        </div>

        {/* Two columns: upcoming list + profile summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-cyan-900">Upcoming Appointments</h2>
              <Link href="/appointments/upcoming" className="text-cyan-700 hover:underline text-sm">
                View all
              </Link>
            </div>

            {doctor.appointments.length === 0 ? (
              <div className="rounded-xl border border-cyan-100 p-6 text-center text-cyan-800">
                No upcoming appointments.
              </div>
            ) : (
              <ul className="divide-y divide-cyan-100/70">
                {doctor.appointments.map((a) => (
                  <li key={a.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-cyan-900">{fmt(a.scheduledAt)}</div>
                      <div className="text-sm text-cyan-700/70">
                        Patient: {a.patient?.user?.name ?? "—"} · Status: {a.status}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/appointments/${a.id}`}
                        className="text-sm px-3 py-1.5 rounded-lg bg-cyan-600/10 text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
                      >
                        View
                      </Link>
                      <Link
                        href={`/appointments/${a.id}`}
                        className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-600/15"
                      >
                        Manage
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Profile summary */}
          <div className="bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-cyan-900">Profile Summary</h2>
            <div className="rounded-xl border border-cyan-100 p-4">
              <div className="text-sm text-cyan-700/70">Name</div>
              <div className="font-medium text-cyan-900">{doctor.user.name ?? "—"}</div>
            </div>
            <div className="rounded-xl border border-cyan-100 p-4">
              <div className="text-sm text-cyan-700/70">Email</div>
              <div className="font-medium text-cyan-900">{doctor.user.email ?? "—"}</div>
            </div>
            <div className="rounded-xl border border-cyan-100 p-4">
              <div className="text-sm text-cyan-700/70">Specialization</div>
              <div className="font-medium text-cyan-900">{doctor.specialization ?? "—"}</div>
            </div>
            <div className="rounded-xl border border-cyan-100 p-4">
              <div className="text-sm text-cyan-700/70">Experience</div>
              <div className="font-medium text-cyan-900">{doctor.experience ?? 0} years</div>
            </div>
            <div className="rounded-xl border border-cyan-100 p-4">
              <div className="text-sm text-cyan-700/70">Consultation Fee</div>
              <div className="font-medium text-cyan-900">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                  Number(doctor.consultationFee ?? 0)
                )}
              </div>
            </div>

            <Link
              href="/doctor/profile"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-white font-medium hover:from-cyan-600 hover:to-emerald-600"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-cyan-100 p-6 text-center">
      <div className="text-cyan-800 font-medium">{message}</div>
      {hint && <div className="text-sm text-cyan-700/70">{hint}</div>}
    </div>
  );
}
