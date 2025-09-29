import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ONLY = ["/admin"];
const DOCTOR_ONLY = ["/doctor"];
const PATIENT_ONLY = ["/patient"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth =
    ADMIN_ONLY.some((p) => pathname.startsWith(p)) ||
    DOCTOR_ONLY.some((p) => pathname.startsWith(p)) ||
    PATIENT_ONLY.some((p) => pathname.startsWith(p));

  if (!needsAuth) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (DOCTOR_ONLY.some((p) => pathname.startsWith(p)) && token.role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (PATIENT_ONLY.some((p) => pathname.startsWith(p)) && token.role !== "PATIENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/doctor/:path*", "/patient/:path*"] };
