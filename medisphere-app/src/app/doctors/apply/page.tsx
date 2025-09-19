// app/doctors/apply/page.tsx
import DoctorApplicationForm from "../../../components/forms/DoctorApplicationForm";

export default function ApplyDoctorPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Apply as Doctor</h1>
      <DoctorApplicationForm />
    </div>
  );
}
