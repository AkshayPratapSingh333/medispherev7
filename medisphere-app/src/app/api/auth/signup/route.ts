import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["PATIENT", "DOCTOR"]).optional().default("PATIENT"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = schema.parse(body);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
      },
      select: { id: true, email: true, role: true, name: true },
    });

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
