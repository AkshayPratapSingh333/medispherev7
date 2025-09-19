// app/api/reports/[id]/download/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import fs from "fs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = fs.readFileSync(report.fileUrl);
  return new Response(buffer, {
    headers: {
      "Content-Type": report.fileType,
      "Content-Disposition": `attachment; filename="${report.fileName}"`,
    },
  });
}
