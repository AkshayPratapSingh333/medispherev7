import Link from "next/link";
import prisma from "../../lib/prisma";

const PAGE_SIZE = 8;

type QueryValue = string | string[] | undefined;
type SearchParams = Record<string, QueryValue>;

function firstValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function readPositiveInt(value: QueryValue, fallback = 1) {
  const n = Number(firstValue(value));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

function buildHref(searchParams: SearchParams, patch: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof firstValue(v) === "string") params.set(k, firstValue(v) as string);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === "") params.delete(k);
    else params.set(k, String(v));
  }
  const q = params.toString();
  return q ? `?${q}` : "/admin";
}

function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "warning"
      ? "bg-amber-100 text-amber-700"
      : tone === "danger"
      ? "bg-rose-100 text-rose-700"
      : "bg-slate-100 text-slate-700";

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClass}`}>{label}</span>;
}

function statTone(value: number) {
  if (value === 0) return "text-slate-700";
  if (value < 5) return "text-amber-700";
  return "text-cyan-700";
}

function ChartRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Pagination({
  title,
  page,
  total,
  searchParams,
  pageKey,
}: {
  title: string;
  page: number;
  total: number;
  searchParams: SearchParams;
  pageKey: string;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
      <span>
        {title}: showing {from}-{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(searchParams, { [pageKey]: Math.max(1, safePage - 1) })}
          className={`rounded border px-2 py-1 ${safePage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-slate-50"}`}
        >
          Prev
        </Link>
        <span className="rounded border px-2 py-1">
          {safePage}/{pages}
        </span>
        <Link
          href={buildHref(searchParams, { [pageKey]: Math.min(pages, safePage + 1) })}
          className={`rounded border px-2 py-1 ${safePage >= pages ? "pointer-events-none opacity-50" : "hover:bg-slate-50"}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

export default async function AdminHome({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const q = (firstValue(searchParams.q) || "").trim();
  const doctorStatus = firstValue(searchParams.doctorStatus) || "ALL";
  const appointmentStatus = firstValue(searchParams.appointmentStatus) || "ALL";

  const doctorsPage = readPositiveInt(searchParams.doctorsPage);
  const patientsPage = readPositiveInt(searchParams.patientsPage);
  const appointmentsPage = readPositiveInt(searchParams.appointmentsPage);
  const reportsPage = readPositiveInt(searchParams.reportsPage);

  const doctorWhere = {
    ...(doctorStatus !== "ALL" ? { status: doctorStatus as "PENDING" | "APPROVED" | "REJECTED" } : {}),
    ...(q
      ? {
          OR: [
            { specialization: { contains: q } },
            { user: { name: { contains: q } } },
            { user: { email: { contains: q } } },
          ],
        }
      : {}),
  };

  const patientWhere = q
    ? {
        OR: [{ user: { name: { contains: q } } }, { user: { email: { contains: q } } }],
      }
    : {};

  const appointmentWhere = {
    ...(appointmentStatus !== "ALL"
      ? { status: appointmentStatus as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED" }
      : {}),
    ...(q
      ? {
          OR: [
            { doctor: { user: { name: { contains: q } } } },
            { patient: { user: { name: { contains: q } } } },
            { doctor: { user: { email: { contains: q } } } },
            { patient: { user: { email: { contains: q } } } },
          ],
        }
      : {}),
  };

  const reportWhere = q
    ? {
        OR: [{ fileName: { contains: q } }, { patient: { user: { name: { contains: q } } } }],
      }
    : {};

  const [
    users,
    doctors,
    patients,
    appointments,
    reports,
    pendingDoctors,
    upcomingAppointments,
    completedAppointments,
    doctorStatusGroup,
    appointmentStatusGroup,
    totalDoctorsFiltered,
    totalPatientsFiltered,
    totalAppointmentsFiltered,
    totalReportsFiltered,
    recentDoctors,
    recentPatients,
    recentAppointments,
    recentReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.report.count(),
    prisma.doctor.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] } } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.doctor.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.appointment.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.doctor.count({ where: doctorWhere }),
    prisma.patient.count({ where: patientWhere }),
    prisma.appointment.count({ where: appointmentWhere }),
    prisma.report.count({ where: reportWhere }),
    prisma.doctor.findMany({
      where: doctorWhere,
      skip: (doctorsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.patient.findMany({
      where: patientWhere,
      skip: (patientsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.appointment.findMany({
      where: appointmentWhere,
      skip: (appointmentsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { scheduledAt: "desc" },
      include: {
        doctor: { include: { user: { select: { name: true, email: true } } } },
        patient: { include: { user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.report.findMany({
      where: reportWhere,
      skip: (reportsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { uploadedAt: "desc" },
      include: { patient: { include: { user: { select: { name: true, email: true } } } } },
    }),
  ]);

  const doctorStatusMap = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  for (const row of doctorStatusGroup) {
    doctorStatusMap[row.status] = row._count.status;
  }

  const appointmentStatusMap = {
    PENDING: 0,
    CONFIRMED: 0,
    RESCHEDULED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  for (const row of appointmentStatusGroup) {
    appointmentStatusMap[row.status] = row._count.status;
  }

  const exportBase = new URLSearchParams();
  if (q) exportBase.set("q", q);
  if (doctorStatus !== "ALL") exportBase.set("doctorStatus", doctorStatus);
  if (appointmentStatus !== "ALL") exportBase.set("appointmentStatus", appointmentStatus);

  const cards = [
    { title: "Total Users", value: users },
    { title: "Doctors", value: doctors },
    { title: "Patients", value: patients },
    { title: "Appointments", value: appointments },
    { title: "Reports", value: reports },
    { title: "Pending Doctors", value: pendingDoctors },
    { title: "Upcoming Appointments", value: upcomingAppointments },
    { title: "Completed Appointments", value: completedAppointments },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">System-wide view of doctors, patients, appointments, and reports.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/doctors" className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50">
            Manage Doctors
          </Link>
          <Link href="/admin/users" className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50">
            Manage Users
          </Link>
          <Link href="/admin/analytics" className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50">
            Analytics
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, specialization, file"
            className="rounded-lg border border-cyan-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
          <select
            name="doctorStatus"
            defaultValue={doctorStatus}
            className="rounded-lg border border-cyan-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          >
            <option value="ALL">Doctor Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            name="appointmentStatus"
            defaultValue={appointmentStatus}
            className="rounded-lg border border-cyan-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          >
            <option value="ALL">Appointment Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="flex gap-2">
            <button className="w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700" type="submit">
              Apply
            </button>
            <Link href="/admin" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium hover:bg-slate-50">
              Reset
            </Link>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href={`/api/admin/export?type=doctors&${exportBase.toString()}`} className="rounded border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700 hover:bg-cyan-100">
            Export Doctors CSV
          </Link>
          <Link href={`/api/admin/export?type=patients&${exportBase.toString()}`} className="rounded border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700 hover:bg-cyan-100">
            Export Patients CSV
          </Link>
          <Link href={`/api/admin/export?type=appointments&${exportBase.toString()}`} className="rounded border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700 hover:bg-cyan-100">
            Export Appointments CSV
          </Link>
          <Link href={`/api/admin/export?type=reports&${exportBase.toString()}`} className="rounded border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700 hover:bg-cyan-100">
            Export Reports CSV
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-xl border border-cyan-100 bg-white/95 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.title}</p>
            <p className={`mt-2 text-2xl font-bold ${statTone(card.value)}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Doctor Status Breakdown</h2>
          <div className="space-y-3">
            <ChartRow label="Approved" value={doctorStatusMap.APPROVED} total={doctors} color="bg-emerald-500" />
            <ChartRow label="Pending" value={doctorStatusMap.PENDING} total={doctors} color="bg-amber-500" />
            <ChartRow label="Rejected" value={doctorStatusMap.REJECTED} total={doctors} color="bg-rose-500" />
          </div>
        </article>
        <article className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Appointment Status Breakdown</h2>
          <div className="space-y-3">
            <ChartRow label="Pending" value={appointmentStatusMap.PENDING} total={appointments} color="bg-amber-500" />
            <ChartRow label="Confirmed" value={appointmentStatusMap.CONFIRMED} total={appointments} color="bg-sky-500" />
            <ChartRow label="Rescheduled" value={appointmentStatusMap.RESCHEDULED} total={appointments} color="bg-violet-500" />
            <ChartRow label="Completed" value={appointmentStatusMap.COMPLETED} total={appointments} color="bg-emerald-500" />
            <ChartRow label="Cancelled" value={appointmentStatusMap.CANCELLED} total={appointments} color="bg-rose-500" />
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent Doctors</h2>
          {recentDoctors.length === 0 ? (
            <p className="text-sm text-slate-600">No doctor records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-3 font-medium">Name</th>
                    <th className="py-2 pr-3 font-medium">Email</th>
                    <th className="py-2 pr-3 font-medium">Specialization</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDoctors.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 text-slate-800">{doc.user?.name || "Unknown"}</td>
                      <td className="py-2 pr-3 text-slate-600">{doc.user?.email || "-"}</td>
                      <td className="py-2 pr-3 text-slate-700">{doc.specialization}</td>
                      <td className="py-2 pr-3">
                        <Badge
                          label={doc.status}
                          tone={doc.status === "APPROVED" ? "success" : doc.status === "REJECTED" ? "danger" : "warning"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            title="Doctors"
            page={doctorsPage}
            total={totalDoctorsFiltered}
            searchParams={searchParams}
            pageKey="doctorsPage"
          />
        </article>

        <article className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent Patients</h2>
          {recentPatients.length === 0 ? (
            <p className="text-sm text-slate-600">No patient records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-3 font-medium">Name</th>
                    <th className="py-2 pr-3 font-medium">Email</th>
                    <th className="py-2 pr-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 text-slate-800">{patient.user?.name || "Unknown"}</td>
                      <td className="py-2 pr-3 text-slate-600">{patient.user?.email || "-"}</td>
                      <td className="py-2 pr-3 text-slate-700">{new Date(patient.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            title="Patients"
            page={patientsPage}
            total={totalPatientsFiltered}
            searchParams={searchParams}
            pageKey="patientsPage"
          />
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent Appointments</h2>
          {recentAppointments.length === 0 ? (
            <p className="text-sm text-slate-600">No appointments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-3 font-medium">Doctor</th>
                    <th className="py-2 pr-3 font-medium">Patient</th>
                    <th className="py-2 pr-3 font-medium">Scheduled</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 text-slate-800">{appointment.doctor.user?.name || "Unknown"}</td>
                      <td className="py-2 pr-3 text-slate-700">{appointment.patient.user?.name || "Unknown"}</td>
                      <td className="py-2 pr-3 text-slate-600">{new Date(appointment.scheduledAt).toLocaleString()}</td>
                      <td className="py-2 pr-3">
                        <Badge
                          label={appointment.status}
                          tone={
                            appointment.status === "COMPLETED"
                              ? "success"
                              : appointment.status === "CANCELLED"
                              ? "danger"
                              : "warning"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            title="Appointments"
            page={appointmentsPage}
            total={totalAppointmentsFiltered}
            searchParams={searchParams}
            pageKey="appointmentsPage"
          />
        </article>

        <article className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent Reports</h2>
          {recentReports.length === 0 ? (
            <p className="text-sm text-slate-600">No reports uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-3 font-medium">File</th>
                    <th className="py-2 pr-3 font-medium">Patient</th>
                    <th className="py-2 pr-3 font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report) => (
                    <tr key={report.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 text-slate-800">{report.fileName}</td>
                      <td className="py-2 pr-3 text-slate-700">{report.patient.user?.name || "Unknown"}</td>
                      <td className="py-2 pr-3 text-slate-600">{new Date(report.uploadedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            title="Reports"
            page={reportsPage}
            total={totalReportsFiltered}
            searchParams={searchParams}
            pageKey="reportsPage"
          />
        </article>
      </section>
    </div>
  );
}
