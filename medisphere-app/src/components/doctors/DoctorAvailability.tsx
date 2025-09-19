// components/doctors/DoctorAvailability.tsx
export default function DoctorAvailability({ slots }: { slots: any }) {
  if (!slots) return <p>No availability</p>;
  return (
    <div>
      <h3 className="font-semibold">Available Slots</h3>
      <pre className="text-sm">{JSON.stringify(slots, null, 2)}</pre>
    </div>
  );
}
