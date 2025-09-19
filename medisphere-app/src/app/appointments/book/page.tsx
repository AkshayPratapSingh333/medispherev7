// app/appointments/book/page.tsx
import AppointmentBookingForm from "../../../components/forms/AppointmentBookingForm";

export default function BookAppointmentPage({ searchParams }: { searchParams?: { doctorId?: string } }) {
  const doctorId = searchParams?.doctorId || "";
  if (!doctorId) return <div>Please choose a doctor first.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Book Appointment</h1>
      <AppointmentBookingForm doctorId={doctorId} />
    </div>
  );
}
