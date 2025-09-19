// components/patients/PatientCard.tsx
export default function PatientCard({ patient }: { patient: any }) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">{patient.user.name}</h3>
      <p>{patient.gender}</p>
      <p>{patient.phoneNumber}</p>
    </div>
  );
}
