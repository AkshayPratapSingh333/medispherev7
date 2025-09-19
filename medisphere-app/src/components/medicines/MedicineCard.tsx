import MedicineReminders from "./MedicineReminders";

export default function MedicineCard({ med }: { med: any }) {
  return (
    <div className="border p-3 rounded">
      <h3 className="font-semibold">{med.name}</h3>
      <p>Dosage: {med.dosage}</p>
      <p>Frequency: {med.frequency}</p>
      <p>Start: {new Date(med.startDate).toLocaleDateString()}</p>
      {med.endDate && <p>End: {new Date(med.endDate).toLocaleDateString()}</p>}
      <MedicineReminders reminders={JSON.parse(med.reminders)} />
    </div>
  );
}
