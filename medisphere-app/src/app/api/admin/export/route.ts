import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";

type ExportType = "doctors" | "patients" | "appointments" | "reports";

function esc(value: unknown) {
  const str = value == null ? "" : String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

function toCsv(headers: string[], rows: Array<Array<unknown>>) {
  const lines = [headers.map(esc).join(",")];
  for (const row of rows) {
    lines.push(row.map(esc).join(","));
  }
  return lines.join("\n");
}

function parseType(value: string | null): ExportType {
  if (value === "doctors" || value === "patients" || value === "appointments" || value === "reports") {
    return value;
  }
  return "doctors";
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = parseType(searchParams.get("type"));
  const q = (searchParams.get("q") || "").trim();
  const doctorStatus = searchParams.get("doctorStatus") || "ALL";
  const appointmentStatus = searchParams.get("appointmentStatus") || "ALL";

  if (type === "doctors") {
    const rows = await prisma.doctor.findMany({
      where: {
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
      },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    const csv = toCsv(
      ["id", "name", "email", "specialization", "experience", "status", "createdAt"],
      rows.map((d) => [d.id, d.user?.name, d.user?.email, d.specialization, d.experience, d.status, d.createdAt.toISOString()])
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="doctors-${Date.now()}.csv"`,
      },
    });
  }

  if (type === "patients") {
    const rows = await prisma.patient.findMany({
      where: q
        ? {
            OR: [{ user: { name: { contains: q } } }, { user: { email: { contains: q } } }],
          }
        : {},
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    const csv = toCsv(
      ["id", "name", "email", "phoneNumber", "gender", "createdAt"],
      rows.map((p) => [p.id, p.user?.name, p.user?.email, p.phoneNumber, p.gender, p.createdAt.toISOString()])
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="patients-${Date.now()}.csv"`,
      },
    });
  }

  if (type === "appointments") {
    const rows = await prisma.appointment.findMany({
      where: {
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
      },
      orderBy: { scheduledAt: "desc" },
      include: { doctor: { include: { user: true } }, patient: { include: { user: true } } },
    });

    const csv = toCsv(
      ["id", "doctor", "patient", "status", "scheduledAt", "duration"],
      rows.map((a) => [
        a.id,
        a.doctor.user?.name,
        a.patient.user?.name,
        a.status,
        a.scheduledAt.toISOString(),
        a.duration,
      ])
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="appointments-${Date.now()}.csv"`,
      },
    });
  }

  const rows = await prisma.report.findMany({
    where: q
      ? {
          OR: [{ fileName: { contains: q } }, { patient: { user: { name: { contains: q } } } }],
        }
      : {},
    orderBy: { uploadedAt: "desc" },
    include: { patient: { include: { user: true } } },
  });

  const csv = toCsv(
    ["id", "fileName", "fileType", "fileSize", "patient", "uploadedAt"],
    rows.map((r) => [r.id, r.fileName, r.fileType, r.fileSize, r.patient.user?.name, r.uploadedAt.toISOString()])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reports-${Date.now()}.csv"`,
    },
  });
}
