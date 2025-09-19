// app/api/auth/reset/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hashed = await hash(password, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset password error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
