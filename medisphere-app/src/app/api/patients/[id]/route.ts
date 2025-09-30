// app/api/patients/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type UpdatableFields = {
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
};

function normalizeString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function parseDOB(v: unknown): Date | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function pickAndCoerce(body: any): UpdatableFields {
  const allowed: UpdatableFields = {};
  if ("dateOfBirth" in body) allowed.dateOfBirth = body.dateOfBirth as string | null;
  if ("gender" in body) allowed.gender = normalizeString(body.gender);
  if ("phoneNumber" in body) allowed.phoneNumber = normalizeString(body.phoneNumber);
  if ("emergencyContact" in body) allowed.emergencyContact = normalizeString(body.emergencyContact);
  if ("medicalHistory" in body) allowed.medicalHistory = normalizeString(body.medicalHistory);
  if ("allergies" in body) allowed.allergies = normalizeString(body.allergies);

  // Final coercions
  const dob = parseDOB(allowed.dateOfBirth ?? null);
  return {
    ...allowed,
    dateOfBirth: dob ? (dob.toISOString() as unknown as any) : null, // Prisma accepts Date; we’ll pass Date below
  };
}

async function ensureOwnerOrAdmin(patientId: string, session: any) {
  if (!session?.user?.id) return { ok: false, status: 401 as const, msg: "Unauthorized" };

  const me = { id: session.user.id, role: (session.user as any).role as string | undefined };
  // Admins allowed
  if (me.role === "ADMIN") return { ok: true, me };

  // Otherwise must own the patient row
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { userId: true },
  });
  if (!patient) return { ok: false, status: 404 as const, msg: "Not found" };
  if (patient.userId !== me.id) return { ok: false, status: 403 as const, msg: "Forbidden" };
  return { ok: true, me };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const guard = await ensureOwnerOrAdmin(params.id, session);
    if (!guard.ok) return NextResponse.json({ error: guard.msg }, { status: guard.status });

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: { user: true, appointments: true, reports: true },
    });
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(patient);
  } catch (err) {
    console.error("GET /patients/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const guard = await ensureOwnerOrAdmin(params.id, session);
    if (!guard.ok) return NextResponse.json({ error: guard.msg }, { status: guard.status });

    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Whitelist + coerce
    const data = pickAndCoerce(raw);

    // Build Prisma update data (Date object for DOB)
    const updateData: any = {
      gender: data.gender ?? null,
      phoneNumber: data.phoneNumber ?? null,
      emergencyContact: data.emergencyContact ?? null,
      medicalHistory: data.medicalHistory ?? null,
      allergies: data.allergies ?? null,
    };
    if ("dateOfBirth" in raw) {
      // preserve explicit clear vs untouched
      const d = parseDOB(raw.dateOfBirth);
      updateData.dateOfBirth = d; // Date | null
    }

    const updated = await prisma.patient.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    // Known Prisma errors
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint violated" }, { status: 409 });
    }
    console.error("PUT /patients/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
