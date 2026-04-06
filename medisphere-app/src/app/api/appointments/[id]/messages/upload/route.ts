import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = Number(process.env.CHAT_UPLOAD_MAX_BYTES || 8 * 1024 * 1024);
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream",
]);

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

function getMessageType(mimeType: string) {
  return mimeType.startsWith("image/") ? "image" : "file";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 422 });
  }

  const originalName = (file.name || "attachment").trim();
  const mimeType = file.type || "application/octet-stream";
  const fileSize = file.size || 0;

  if (!ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }
  if (fileSize > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${Math.floor(MAX_BYTES / (1024 * 1024))} MB.` },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await prisma.chatUpload.create({
    data: {
      appointmentId: id,
      uploaderId: session.user.id,
      fileName: originalName,
      fileType: mimeType,
      fileSize,
      fileData: buffer,
    },
    select: { id: true },
  });

  const fileUrl = `/api/appointments/${id}/messages/files/${upload.id}`;

  return NextResponse.json({
    fileName: originalName,
    mimeType,
    fileSize,
    fileUrl,
    messageType: getMessageType(mimeType),
  });
}
