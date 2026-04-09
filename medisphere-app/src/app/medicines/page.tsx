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
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.VERCEL_URL || process.env.NEXTAUTH_URL || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  
  const res = await fetch(`${baseUrl}/api/medicines`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function MedicinesPage() {
  const meds = await fetchMeds();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-amber-600 to-emerald-700 bg-clip-text text-transparent mb-2">Medications</h1>
          <p className="text-stone-600">Manage and track your medications</p>
        </div>
        
        {meds.length > 0 ? (
          <div className="mt-6 grid gap-4 md:gap-6">
            {meds.map((m) => (
              <MedicineCard key={m.id} med={m} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200/50 bg-white/50 backdrop-blur-sm p-8 text-center">
            <p className="text-stone-600">No medications recorded yet. Start by searching medicines below.</p>
          </div>
        )}
      </div>
      
      <div className="max-w-6xl mx-auto mt-10">
        <MedicineKnowledgeSearch />
      </div>
    </div>
  );
}
