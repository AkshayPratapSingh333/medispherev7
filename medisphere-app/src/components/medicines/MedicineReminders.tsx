export default function MedicineReminders({ reminders }: { reminders: string[] }) {
  return (
    <div className="mt-4 pt-4 border-t border-amber-200/40">
      <h4 className="font-semibold text-stone-900 text-sm mb-3 flex items-center gap-2">
        <span className="text-amber-500">🔔</span>
        Reminders
      </h4>
      <ul className="space-y-2">
        {reminders.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-stone-600 bg-white/40 rounded-lg px-3 py-2 border border-amber-200/30">
            <span className="text-emerald-600 font-bold mt-0.5">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
