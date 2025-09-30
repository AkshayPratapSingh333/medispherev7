import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../../../../lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureMembership(appointmentId: string, userId: string) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      doctor:  { select: { userId: true } },
      patient: { select: { userId: true } },
    },
  });
  if (!appt) return { ok: false, status: 404 as const };
  const isMember = appt.patient?.userId === userId || appt.doctor?.userId === userId;
  return { ok: isMember, status: isMember ? 200 : (403 as const) };
}

export async function GET(_: Request, { params }: { params: any }) {
  // `params` in Next.js App Router can be a thenable proxy in some environments.
  // Await it before accessing properties to satisfy the runtime requirement.
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mem = await ensureMembership(id, session.user.id);
  if (!mem.ok) return NextResponse.json({ error: mem.status === 404 ? "Not found" : "Forbidden" }, { status: mem.status });

  const messages = await prisma.chatMessage.findMany({
    where: { appointmentId: id },
    orderBy: { timestamp: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: any }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mem = await ensureMembership(id, session.user.id);
  if (!mem.ok) {
    return NextResponse.json(
      { error: mem.status === 404 ? "Not found" : "Forbidden" },
      { status: mem.status }
    );
  }

  const { message, messageType = "text" } = await req.json();
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  // Determine DOCTOR vs PATIENT based on membership
  const appt = await prisma.appointment.findUnique({
    where: { id },
    select: { doctor: { select: { userId: true } }, patient: { select: { userId: true } } },
  });
  const senderType = appt?.doctor?.userId === session.user.id ? "DOCTOR" : "PATIENT";

  const saved = await prisma.chatMessage.create({
    data: {
      appointmentId: id,
      senderId: session.user.id,
      senderType,
      message,
      messageType,
    },
  });

  return NextResponse.json(saved);
}
