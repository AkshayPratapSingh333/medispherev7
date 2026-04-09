/* eslint-disable @typescript-eslint/no-explicit-any */
import MedicineReminders from "./MedicineReminders";

export default function MedicineCard({ med }: { med: any }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-5 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10 transition-all duration-300">
      <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"></div>
        {med.name}
      </h3>
      <div className="space-y-2 text-sm text-gray-200">
        <p className="flex justify-between"><span className="text-gray-400">Dosage:</span><span className="font-semibold text-white">{med.dosage}</span></p>
        <p className="flex justify-between"><span className="text-gray-400">Frequency:</span><span className="font-semibold text-white">{med.frequency}</span></p>
        <p className="flex justify-between"><span className="text-gray-400">Start:</span><span className="font-semibold text-cyan-300">{new Date(med.startDate).toLocaleDateString()}</span></p>
        {med.endDate && <p className="flex justify-between"><span className="text-gray-400">End:</span><span className="font-semibold text-emerald-300">{new Date(med.endDate).toLocaleDateString()}</span></p>}
      </div>
      <MedicineReminders reminders={JSON.parse(med.reminders)} />
    </div>
  );
}
