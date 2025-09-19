import MedicineForm from "../../components/medicines/MedicineForm";
import useSWR from "swr";
import MedicineCard from "../../components/medicines/MedicineCard";

async function fetchMeds() {
  const res = await fetch("http://localhost:3000/api/medicines", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function MedicinesPage() {
  const meds = await fetchMeds();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Medicines</h1>
      <MedicineForm />
      <div className="mt-6 space-y-3">
        {meds.map((m: any) => (
          <MedicineCard key={m.id} med={m} />
        ))}
      </div>
    </div>
  );
}
