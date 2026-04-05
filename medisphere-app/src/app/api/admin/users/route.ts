import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";

type Role = "ADMIN" | "DOCTOR" | "PATIENT";

function isRole(value: string): value is Role {
  return value === "ADMIN" || value === "DOCTOR" || value === "PATIENT";
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") return null;
  return session;
}

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const role = searchParams.get("role") || "ALL";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") || "10")));

  const where = {
    ...(role !== "ALL" && isRole(role) ? { role } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        doctor: { select: { id: true, status: true, specialization: true } },
        patient: { select: { id: true } },
      },
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    users,
  });
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as { userId?: string; role?: string };
  if (!body?.userId || !body?.role || !isRole(body.role)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const myId = (session.user as { id?: string }).id;
  if (myId === body.userId && body.role !== "ADMIN") {
    return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: body.userId },
    data: { role: body.role },
    select: { id: true, role: true, email: true, name: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: myId || "unknown",
      action: "UPDATE_ROLE",
      resource: "User",
      details: `${updated.email} => ${updated.role}`,
      ipAddress: null,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as { userId?: string };
  if (!body?.userId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const myId = (session.user as { id?: string }).id;
  if (myId === body.userId) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: body.userId },
    select: { id: true, email: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Keep at least one admin account intact and avoid accidental admin deletion.
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Deleting admin users is not allowed here." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: target.id } });

  await prisma.auditLog.create({
    data: {
      userId: myId || "unknown",
      action: "DELETE_USER",
      resource: "User",
      details: `${target.email} (${target.role}) deleted`,
      ipAddress: null,
    },
  });

  return NextResponse.json({ ok: true });
}
