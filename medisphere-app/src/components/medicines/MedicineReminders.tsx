export default function MedicineReminders({ reminders }: { reminders: string[] }) {
  return (
    <div className="p-2">
      <h4 className="font-semibold">Reminders</h4>
      <ul>
        {reminders.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
