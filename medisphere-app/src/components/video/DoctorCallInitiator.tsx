"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";

interface DoctorCallInitiatorProps {
  appointmentId: string;
  patientName?: string;
}

export default function DoctorCallInitiator({ appointmentId }: DoctorCallInitiatorProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { emit } = useSocket();
  const [isInitiating, setIsInitiating] = useState(false);

  const handleInitiateCall = async () => {
    if (!session?.user?.id) {
      alert("You must be signed in to initiate a call");
      return;
    }

    try {
      setIsInitiating(true);
      console.log("📞 Initiating call for appointment:", appointmentId);

      // Ensure socket has a moment to connect on first use.
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Send call initiation signal to signaling server
      emit("call:initiate", {
        appointmentId,
        from: session.user.id,
        doctorName: session.user.name || "Doctor",
      });

      // Navigate to the video call page
      setTimeout(() => {
        router.push(`/appointments/${appointmentId}/video`);
      }, 500);
    } catch (error) {
      console.error("❌ Error initiating call:", error);
      alert("Failed to initiate call. Please try again.");
      setIsInitiating(false);
    }
  };

  return (
    <Button
      onClick={handleInitiateCall}
      disabled={isInitiating}
      className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-6 py-2"
      size="lg"
    >
      {isInitiating ? (
        <>
          <span className="animate-pulse">📞</span>
          Initiating Call...
        </>
      ) : (
        <>
          <span>📞</span>
          Start Video Call
        </>
      )}
    </Button>
  );
}
