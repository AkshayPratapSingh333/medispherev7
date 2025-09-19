import { getServerSession } from "next-auth";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

// Proper type for doctor with relations
type DoctorWithRelations = Prisma.DoctorGetPayload<{
  include: { appointments: true; reviews: true };
}>;

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <div>Please sign in</div>;
  }

  const doctor: DoctorWithRelations | null = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: { appointments: true, reviews: true },
  });

  if (!doctor) {
    return <div>You are not a registered doctor.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      <p>Welcome Dr. {session.user.name ?? session.user.email}</p>
      <p>Status: {doctor.status}</p>

      <h2 className="mt-4 font-semibold">Appointments</h2>
      <ul>
        {doctor.appointments.map((a) => (
          <li key={a.id}>
            {a.scheduledAt.toString()} — {a.status}
          </li>
        ))}
      </ul>

      <h2 className="mt-4 font-semibold">Reviews</h2>
      <ul>
        {doctor.reviews.map((r) => (
          <li key={r.id}>
            ⭐ {r.rating} — {r.comment ?? "No comment"}
          </li>
        ))}
      </ul>
    </div>
  );
}
