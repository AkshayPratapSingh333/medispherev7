import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // check if user is a patient
  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!patient) {
    return NextResponse.json({ error: "Not a patient" }, { status: 403 });
  }

  // Save file locally (in /uploads/reports)
  const uploadDir = path.join(process.cwd(), "uploads", "reports");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, buffer);

  // Save metadata in DB
  const report = await prisma.report.create({
    data: {
      patientId: patient.id,
      fileName: file.name,
      fileUrl: filepath, // NOTE: For production → store S3/GCS URL instead
      fileType: file.type,
      fileSize: file.size,
    },
  });

  return NextResponse.json(report);
}
