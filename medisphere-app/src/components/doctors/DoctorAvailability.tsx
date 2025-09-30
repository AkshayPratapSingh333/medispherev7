// components/doctors/DoctorAvailability.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

type TimeSlot = { from: string; to: string };
type Slots = Record<string, TimeSlot[]>; // e.g. { mon: [{from:"09:00",to:"11:00"}], ... }

const DAY_LABEL: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

export default function DoctorAvailability({ slots }: { slots?: Slots | null }) {
  if (!slots || Object.keys(slots).length === 0) {
    return (
      <div className="rounded-xl border border-cyan-100 bg-white p-4 text-center text-cyan-800">
        No availability published yet.
      </div>
    );
  }

  const orderedDays = ["mon","tue","wed","thu","fri","sat","sun"].filter(d => d in slots);

  return (
    <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-cyan-900">Available Slots</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {orderedDays.map((day) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl ring-1 ring-cyan-100 bg-gradient-to-br from-sky-50 to-emerald-50 p-3"
            >
              <div className="mb-2 inline-flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-cyan-900">{DAY_LABEL[day] ?? day}</span>
              </div>
              {slots[day]?.length ? (
                <div className="flex flex-wrap gap-2">
                  {slots[day].map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-sm text-cyan-800 ring-1 ring-cyan-200"
                    >
                      {s.from}–{s.to}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-cyan-700/70">No sessions</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
