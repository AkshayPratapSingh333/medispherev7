import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import ProfileUpdateForm from "../../../components/forms/ProfileUpdateForm";

export default async function PatientProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return <div>Please sign in</div>;

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!patient) return <div>No patient profile found.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Update Profile</h1>
      <ProfileUpdateForm patient={patient} />
    </div>
  );
}
