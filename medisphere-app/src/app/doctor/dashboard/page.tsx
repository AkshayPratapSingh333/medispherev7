import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

// Type: doctor with relations
type DoctorWithRelations = Prisma.DoctorGetPayload<{
  include: { appointments: true; reviews: true };
}>;

function formatDate(d: Date) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toString();
  }
}

function avgRating(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };
  const cls = map[status] ?? "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-cyan-800">Please sign in</h1>
          <p className="text-cyan-700/70">You need an account to view this page.</p>
        </div>
      </div>
    );
  }

  const doctor: DoctorWithRelations | null = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: { appointments: true, reviews: true },
  });

  if (!doctor) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-cyan-800">Not registered as a doctor</h1>
          <p className="text-cyan-700/70">Please complete your doctor application to access the dashboard.</p>
          <a
            href="/doctor/apply"
            className="inline-block mt-4 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-cyan-500 to-emerald-500"
          >
            Apply Now
          </a>
        </div>
      </div>
    );
  }

  const upcoming = doctor.appointments
    .filter(a => a.status !== "CANCELLED" && a.scheduledAt > new Date())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const past = doctor.appointments
    .filter(a => a.scheduledAt <= new Date())
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

  const ratingNumbers = doctor.reviews.map(r => r.rating);
  const average = avgRating(ratingNumbers);

  return (
    <div className="min-h-screen mt-11 bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-6xl mx-auto  px-4 py-8">
        {/* Header */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-5 shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                  Doctor Dashboard
                </h1>
                <p className="text-cyan-700/70">
                  Welcome, <span className="font-medium">{session.user.name ?? session.user.email}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={doctor.status} />
                <a
                  href="/doctor/profile/edit"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-emerald-500"
                >
                  Edit Profile
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-cyan-100 p-5 shadow-sm">
            <div className="text-sm text-cyan-700/70">Upcoming Appointments</div>
            <div className="mt-1 text-3xl font-semibold text-cyan-800">{upcoming.length}</div>
          </div>
          <div className="bg-white rounded-2xl border border-cyan-100 p-5 shadow-sm">
            <div className="text-sm text-cyan-700/70">Reviews</div>
            <div className="mt-1 text-3xl font-semibold text-cyan-800">{doctor.reviews.length}</div>
          </div>
          <div className="bg-white rounded-2xl border border-cyan-100 p-5 shadow-sm">
            <div className="text-sm text-cyan-700/70">Average Rating</div>
            <div className="mt-1 text-3xl font-semibold text-cyan-800">{average.toFixed(1)}<span className="text-base">/5</span></div>
          </div>
        </div>

        {/* Two-column: Upcoming + Recent Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-cyan-900">Upcoming Appointments</h2>
              <a href="/doctor/appointments" className="text-cyan-700 hover:underline text-sm">View all</a>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState message="No upcoming appointments" hint="When patients book, they’ll appear here." />
            ) : (
              <ul className="divide-y divide-cyan-100/70">
                {upcoming.slice(0, 6).map((a) => (
                  <li key={a.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-cyan-900">{formatDate(a.scheduledAt)}</div>
                      <div className="text-sm text-cyan-700/70">Status: {a.status}</div>
                    </div>
                    <a
                      href={`/doctor/appointments/${a.id}`}
                      className="text-sm px-3 py-1.5 rounded-lg bg-cyan-600/10 text-cyan-700 ring-1 ring-cyan-200"
                    >
                      Manage
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {/* Past appointments quick list */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-cyan-900 mb-2">Recent Past Appointments</h3>
              {past.length === 0 ? (
                <p className="text-sm text-cyan-700/70">No past appointments yet.</p>
              ) : (
                <ul className="grid md:grid-cols-2 gap-3">
                  {past.slice(0, 4).map((a) => (
                    <li key={a.id} className="p-3 rounded-xl border border-cyan-100">
                      <div className="text-cyan-900 font-medium">{formatDate(a.scheduledAt)}</div>
                      <div className="text-sm text-cyan-700/70">Status: {a.status}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-cyan-900">Recent Reviews</h2>
              <a href="/doctor/reviews" className="text-cyan-700 hover:underline text-sm">View all</a>
            </div>
            {doctor.reviews.length === 0 ? (
              <EmptyState message="No reviews yet" hint="Reviews received from patients will appear here." />
            ) : (
              <ul className="space-y-3">
                {doctor.reviews.slice(0, 5).map((r) => (
                  <li key={r.id} className="p-3 rounded-xl border border-cyan-100">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-cyan-900">⭐ {r.rating}/5</div>
                      {r.createdAt && (
                        <div className="text-xs text-cyan-700/60">{formatDate(r.createdAt as unknown as Date)}</div>
                      )}
                    </div>
                    <p className="text-sm text-cyan-800/80 mt-1">{r.comment ?? "No comment"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/doctor/schedule"
            className="px-4 py-2 rounded-lg text-sm font-medium text-cyan-800 bg-cyan-50 ring-1 ring-cyan-200 hover:bg-cyan-100"
          >
            Edit Availability
          </a>
          <a
            href="/doctor/settings"
            className="px-4 py-2 rounded-lg text-sm font-medium text-emerald-800 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-100"
          >
            Settings
          </a>
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
