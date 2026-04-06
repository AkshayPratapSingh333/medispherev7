import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureMembership(appointmentId: string, userId: string) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      doctor: { select: { userId: true } },
      patient: { select: { userId: true } },
    },
  });

  if (!appt) return { ok: false, status: 404 as const };
  const isMember = appt.patient?.userId === userId || appt.doctor?.userId === userId;
  return { ok: isMember, status: isMember ? 200 : (403 as const) };
}

function safeFileName(name: string) {
  return (name || "attachment").replace(/[\r\n"]/g, "_");
}

function contentDisposition(fileType: string, fileName: string) {
  const mode = fileType.startsWith("image/") ? "inline" : "attachment";
  return `${mode}; filename="${safeFileName(fileName)}"`;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id, fileId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mem = await ensureMembership(id, session.user.id);
  if (!mem.ok) {
    return NextResponse.json(
      { error: mem.status === 404 ? "Not found" : "Forbidden" },
      { status: mem.status }
    );
  }

  const upload = await prisma.chatUpload.findFirst({
    where: {
      id: fileId,
      appointmentId: id,
    },
    select: {
      fileName: true,
      fileType: true,
      fileData: true,
    },
  });

  if (!upload) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(Buffer.from(upload.fileData as Uint8Array), {
    status: 200,
    headers: {
      "Content-Type": upload.fileType || "application/octet-stream",
      "Content-Disposition": contentDisposition(upload.fileType || "", upload.fileName),
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
