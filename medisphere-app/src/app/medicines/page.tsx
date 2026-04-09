import MedicineCard from "../../components/medicines/MedicineCard";
import MedicineKnowledgeSearch from "../../components/medicines/MedicineKnowledgeSearch";

type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  reminders: string;
};

async function fetchMeds(): Promise<MedicationItem[]> {
  const res = await fetch("http://localhost:3000/api/medicines", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function MedicinesPage() {
  const meds = await fetchMeds();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Medications</h1>
          <p className="text-gray-300">Manage and track your medications</p>
        </div>
        
        {meds.length > 0 ? (
          <div className="mt-6 grid gap-4 md:gap-6">
            {meds.map((m) => (
              <MedicineCard key={m.id} med={m} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center">
            <p className="text-gray-400">No medications recorded yet. Start by searching medicines below.</p>
          </div>
        )}
      </div>
      
      <div className="max-w-6xl mx-auto mt-10">
        <MedicineKnowledgeSearch />
      </div>
    </div>
  );
}
