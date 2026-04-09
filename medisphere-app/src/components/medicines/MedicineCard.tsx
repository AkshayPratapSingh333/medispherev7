/* eslint-disable @typescript-eslint/no-explicit-any */
import MedicineReminders from "./MedicineReminders";

export default function MedicineCard({ med }: { med: any }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-white/60 to-stone-50/50 backdrop-blur-md border border-amber-200/50 p-5 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10 transition-all duration-300">
      <h3 className="font-bold text-lg text-stone-900 mb-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500"></div>
        {med.name}
      </h3>
      <div className="space-y-2 text-sm text-stone-600">
        <p className="flex justify-between"><span className="text-stone-500">Dosage:</span><span className="font-semibold text-stone-800">{med.dosage}</span></p>
        <p className="flex justify-between"><span className="text-stone-500">Frequency:</span><span className="font-semibold text-stone-800">{med.frequency}</span></p>
        <p className="flex justify-between"><span className="text-stone-500">Start:</span><span className="font-semibold text-emerald-700">{new Date(med.startDate).toLocaleDateString()}</span></p>
        {med.endDate && <p className="flex justify-between"><span className="text-stone-500">End:</span><span className="font-semibold text-amber-700">{new Date(med.endDate).toLocaleDateString()}</span></p>}
      </div>
      <MedicineReminders reminders={JSON.parse(med.reminders)} />
    </div>
  );
}
