// app/doctors/page.tsx
import DoctorList from "../../components/doctors/DoctorList";

export default function DoctorsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Doctors</h1>
      <DoctorList />
    </div>
  );
}
