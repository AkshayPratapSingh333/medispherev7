// app/api/socket/token/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { SignJWT } from "jose";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    sub: session.user.id,
    email: session.user.email,
    role: session.user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 5) // expires in 5 mins
    .sign(secret);

  return NextResponse.json({ token });
}
