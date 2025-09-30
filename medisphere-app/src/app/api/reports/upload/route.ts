import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB cap
const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "Missing file" }, { status: 422 });

  const fileName = ((form.get("fileName") as string) || "report").trim();
  const description = ((form.get("description") as string) || "").trim() || null;

  const fileType = file.type || "application/octet-stream";
  const fileSize = file.size || 0;

  if (!ALLOWED.has(fileType)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  if (fileSize > MAX_BYTES) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Ensure patient row for this user
  const patient = await prisma.patient.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  const report = await prisma.report.create({
    data: {
      patientId: patient.id,
      fileName,
      fileType,
      fileSize,
      description,
      aiAnalysis: null,
      fileData: buffer, // <- store bytes into MySQL
    },
    select: {
      id: true, fileName: true, fileType: true, fileSize: true,
      uploadedAt: true, description: true, aiAnalysis: true,
    },
  });

  return NextResponse.json(report, { status: 201 });
}