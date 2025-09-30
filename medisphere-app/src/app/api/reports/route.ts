import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 20)));
  const search = (url.searchParams.get("q") || "").trim();

  const role = (session.user as any).role;
  const baseWhere: any = role === "ADMIN" ? {} : { patient: { userId: session.user.id } };
  const where =
    search.length > 0
      ? { AND: [baseWhere], fileName: { contains: search, mode: "insensitive" } }
      : baseWhere;

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        uploadedAt: true,
        description: true,
        aiAnalysis: true,
        patient: { select: { id: true, user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({
    page,
    pageSize,
    total,
    items,
  });
}