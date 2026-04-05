// app/api/admin/alerts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [pendingDoctors, cancelledRecent, failedLogins] = await Promise.all([
      prisma.doctor.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({
        where: {
          status: "CANCELLED",
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: { contains: "LOGIN_FAILED" },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const alerts: Array<{ id: string; message: string; level: "critical" | "warning" | "info" }> = [];

    if (pendingDoctors > 0) {
      alerts.push({
        id: "pending-doctors",
        message: `${pendingDoctors} doctor application(s) pending review.`,
        level: pendingDoctors > 10 ? "critical" : "warning",
      });
    }

    if (cancelledRecent > 0) {
      alerts.push({
        id: "cancelled-appointments",
        message: `${cancelledRecent} appointment(s) were cancelled in the last 7 days.`,
        level: cancelledRecent > 20 ? "critical" : "warning",
      });
    }

    if (failedLogins > 0) {
      alerts.push({
        id: "failed-logins",
        message: `${failedLogins} failed login attempt(s) in the last 24 hours.`,
        level: failedLogins > 25 ? "critical" : "warning",
      });
    }

    if (alerts.length === 0) {
      alerts.push({ id: "healthy", message: "System looks healthy. No active alerts.", level: "info" });
    }

    return NextResponse.json(alerts);
  } catch {
    return NextResponse.json([{ id: "fallback", message: "Unable to evaluate alerts right now.", level: "warning" }]);
  }
}
