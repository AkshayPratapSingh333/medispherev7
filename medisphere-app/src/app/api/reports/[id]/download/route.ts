// app/api/reports/[id]/download/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    select: {
      fileName: true,
      fileType: true,
      fileSize: true,
      fileData: true,
      patient: { select: { userId: true } },
    },
  });
  if (!report) return new NextResponse("Not found", { status: 404 });

  const isOwner = report.patient.userId === session.user.id;
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!(isOwner || isAdmin)) return new NextResponse("Forbidden", { status: 403 });

  const headers = new Headers();
  headers.set("Content-Type", report.fileType);
  headers.set("Content-Length", String(report.fileSize));
  headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(report.fileName)}"`);

  const body = Buffer.from(report.fileData as Uint8Array);
  return new NextResponse(body, { status: 200, headers });
}
