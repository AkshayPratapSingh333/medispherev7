// components/forms/AppointmentBookingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (event: string, cb: (payload: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function AppointmentBookingForm({
  doctorId,
  consultationFee,
}: {
  doctorId: string;
  consultationFee: number | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: "",
    time: "",
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (!form.date || !form.time) {
      setSaving(false);
      alert("Please select date and time");
      return;
    }

    if (!consultationFee || consultationFee <= 0) {
      setSaving(false);
      alert("Consultation fee is not configured for this doctor");
      return;
    }

    // Local ISO assembly (assumes local timezone)
    const scheduledAt = new Date(`${form.date}T${form.time}:00`);
    const orderRes = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
      }),
    });

    if (!orderRes.ok) {
      setSaving(false);
      const j = await orderRes.json().catch(() => ({}));
      alert(j.error || "Could not initialize payment");
      return;
    }

    const orderData = (await orderRes.json()) as {
      keyId: string;
      orderId: string;
      amount: number;
      currency: string;
      doctorName?: string;
    };

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setSaving(false);
      alert("Razorpay checkout failed to load. Please try again.");
      return;
    }

    const options: RazorpayCheckoutOptions = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "MediSphere",
      description: `Consultation with ${orderData.doctorName ?? "doctor"}`,
      order_id: orderData.orderId,
      handler: async (response) => {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId,
            scheduledAt: scheduledAt.toISOString(),
            notes: form.notes,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });

        setSaving(false);
        if (!verifyRes.ok) {
          const j = await verifyRes.json().catch(() => ({}));
          alert(j.error || "Payment verification failed");
          return;
        }

        const appt = (await verifyRes.json()) as { id: string };
        router.push(`/appointments/${appt.id}`);
      },
      modal: {
        ondismiss: () => {
          setSaving(false);
        },
      },
      theme: {
        color: "#0891b2",
      },
    };

    const checkout = new window.Razorpay(options);
    checkout.on("payment.failed", () => {
      setSaving(false);
      alert("Payment failed. Please try again.");
    });
    checkout.open();
  }

  const input = "border border-emerald-200/70 bg-white/90 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300/70 placeholder:text-emerald-600/50 shadow-sm";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-emerald-700/70 mb-1">Date</label>
          <input type="date" className={input + " w-full"} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-emerald-700/70 mb-1">Time</label>
          <input type="time" className={input + " w-full"} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-emerald-700/70 mb-1">Notes (optional)</label>
        <textarea className={input + " w-full"} rows={4} placeholder="Reason for visit / symptoms" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>

      <button type="submit" disabled={saving} className="w-full py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:opacity-70">
        {saving ? "Processing..." : "Pay & Book Appointment"}
      </button>
    </form>
  );
}
