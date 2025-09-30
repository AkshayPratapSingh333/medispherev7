// app/api/reports/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

async function getOwnedOrAdmin(reportId: string, userId: string) {
  return prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      uploadedAt: true,
      description: true,
      aiAnalysis: true,
      patient: { select: { userId: true } },
    },
  }).then(r => r && { r, isOwner: r.patient.userId === userId });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const found = await getOwnedOrAdmin(params.id, session.user.id);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!(found.isOwner || isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { patient, ...report } = found.r!;
  return NextResponse.json(report);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { fileName, description, aiAnalysis } = body as {
    fileName?: string;
    description?: string | null;
    aiAnalysis?: string | null;
  };

  const found = await getOwnedOrAdmin(params.id, session.user.id);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!(found.isOwner || isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.report.update({
    where: { id: params.id },
    data: {
      ...(typeof fileName === "string" && fileName.trim().length > 0 ? { fileName: fileName.trim() } : {}),
      ...(typeof description === "string" || description === null ? { description } : {}),
      ...(typeof aiAnalysis === "string" || aiAnalysis === null ? { aiAnalysis } : {}),
    },
    select: {
      id: true, fileName: true, fileType: true, fileSize: true,
      uploadedAt: true, description: true, aiAnalysis: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const found = await prisma.report.findUnique({
    where: { id: params.id },
    select: { id: true, patient: { select: { userId: true } } },
  });
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = found.patient.userId === session.user.id;
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!(isOwner || isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.report.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
