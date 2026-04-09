"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/use-socket";

interface IncomingCall {
  appointmentId: string;
  from: string;
  doctorName: string;
}

export default function IncomingCallModal() {
  const { on, off, emit } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isRinging, setIsRinging] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Listen for incoming calls
    const handleIncomingCall = (data: IncomingCall) => {
      // Ignore unrelated appointment notifications when user is on another appointment detail page.
      if (pathname?.includes("/appointments/")) {
        const match = pathname.match(/\/appointments\/([^/]+)/);
        const currentAppointmentId = match?.[1];
        if (currentAppointmentId && currentAppointmentId !== data.appointmentId) {
          return;
        }
      }

      console.log("📞 Incoming call received:", data);
      setIncomingCall(data);
      setIsRinging(true);

      // Auto-stop ringing after 60 seconds (call timeout)
      const id = setTimeout(() => {
        setIsRinging(false);
        setIncomingCall(null);
      }, 60000);
      timeoutRef.current = id;
    };

    const handleCallDeclined = () => {
      console.log("❌ Call declined by patient");
      setIncomingCall(null);
      setIsRinging(false);
    };

    on("call:incoming", handleIncomingCall);
    on("call:declined", handleCallDeclined);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      off("call:incoming", handleIncomingCall);
      off("call:declined", handleCallDeclined);
    };
  }, [on, off, pathname]);

  const handleAccept = () => {
    if (!incomingCall) return;

    console.log("✅ Accepting call from", incomingCall.doctorName);
    setIsRinging(false);

    // Emit acceptance event
    emit("call:accept", { appointmentId: incomingCall.appointmentId });

    // Join the meeting room
    emit("join-meeting", {
      meetingId: incomingCall.appointmentId,
      meetingData: { appointmentId: incomingCall.appointmentId, startTime: new Date() },
    });

    // Clear modal
    setIncomingCall(null);

    // Move patient into the actual video screen after accepting.
    router.push(`/appointments/${incomingCall.appointmentId}/video`);
  };

  const handleDecline = () => {
    if (!incomingCall) return;

    console.log("❌ Declining call from", incomingCall.doctorName);
    setIsRinging(false);

    // Emit decline event
    emit("call:decline", { appointmentId: incomingCall.appointmentId });

    // Clear modal
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Ringing animation */}
        {isRinging && (
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-emerald-500/20" />
        )}

        <div className="relative px-8 py-12 text-center">
          {/* Animated ringing icon */}
          {isRinging && (
            <div className="mb-6 flex justify-center">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600">
                  <span className="text-3xl">📞</span>
                </div>
              </div>
            </div>
          )}

          {/* Doctor name */}
          <h2 className="mb-2 text-2xl font-bold text-emerald-900">{incomingCall.doctorName}</h2>
          <p className="mb-6 text-emerald-700/70">is calling you</p>

          {/* Appointment ID (small) */}
          <p className="mb-8 text-sm text-emerald-600/60">Appointment ID: {incomingCall.appointmentId.slice(0, 8)}</p>

          {/* Call status */}
          {isRinging && (
            <p className="mb-8 animate-pulse text-sm font-medium text-emerald-600">
              Incoming call...
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            {/* Accept button */}
            <button
              onClick={handleAccept}
              className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-transform"
            >
              <span className="flex items-center justify-center gap-2">
                <span>📞</span>
                Accept
              </span>
            </button>

            {/* Decline button */}
            <button
              onClick={handleDecline}
              className="flex-1 rounded-lg bg-red-500/10 px-6 py-3 font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-500/20 active:scale-95 transition-transform"
            >
              <span className="flex items-center justify-center gap-2">
                <span>❌</span>
                Decline
              </span>
            </button>
          </div>

          {/* Small note */}
          <p className="mt-6 text-xs text-cyan-600/50">
            The call will automatically end in 60 seconds if not answered
          </p>
        </div>
      </div>
    </div>
  );
}
