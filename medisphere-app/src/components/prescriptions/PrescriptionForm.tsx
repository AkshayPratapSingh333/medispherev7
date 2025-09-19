"use client";
import { useState } from "react";

export default function PrescriptionForm({ appointmentId }: { appointmentId: string }) {
  const [medications, setMedications] = useState("");
  const [instructions, setInstructions] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId,
        medications: JSON.parse(medications),
        instructions,
      }),
    });
    if (res.ok) alert("Prescription saved");
    else alert("Error saving prescription");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        className="border p-2 w-full"
        placeholder='Medications JSON e.g. [{"name":"Paracetamol","dose":"500mg"}]'
        value={medications}
        onChange={(e) => setMedications(e.target.value)}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Instructions"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      />
      <button className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
    </form>
  );
}
