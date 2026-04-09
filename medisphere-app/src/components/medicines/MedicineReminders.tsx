export default function MedicineReminders({ reminders }: { reminders: string[] }) {
  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
        <span className="text-cyan-400">🔔</span>
        Reminders
      </h4>
      <ul className="space-y-2">
        {reminders.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
            <span className="text-emerald-400 font-bold mt-0.5">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
