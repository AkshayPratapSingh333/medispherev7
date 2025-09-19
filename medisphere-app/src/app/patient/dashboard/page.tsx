import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

type PatientWithRelations = Prisma.PatientGetPayload<{
  include: { appointments: true; reports: true };
}>;

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <div>Please sign in</div>;
  }

  const patient: PatientWithRelations | null = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: { appointments: true, reports: true },
  });

  if (!patient) {
    return <div>No patient profile found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>
      <p>Welcome, {session.user.name ?? session.user.email}</p>

      <h2 className="mt-4 font-semibold">Appointments</h2>
      <ul>
        {patient.appointments.map((a) => (
          <li key={a.id}>
            {a.scheduledAt.toString()} — {a.status}
          </li>
        ))}
      </ul>

      <h2 className="mt-4 font-semibold">Reports</h2>
      <ul>
        {patient.reports.map((r) => (
          <li key={r.id}>{r.fileName}</li>
        ))}
      </ul>
    </div>
  );
}
