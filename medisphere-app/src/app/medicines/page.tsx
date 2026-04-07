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
    <div className="w-full p-6">
      <h1 className="text-2xl font-semibold mb-4">Medicines</h1>
      <div className="mt-6 space-y-3">
        {meds.map((m) => (
          <MedicineCard key={m.id} med={m} />
        ))}
      </div>
      <MedicineKnowledgeSearch />
    </div>
  );
}
