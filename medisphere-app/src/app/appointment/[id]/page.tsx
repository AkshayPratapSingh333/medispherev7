"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import MeetingRoom from "@/components/video/MeetingRoom";
import { Socket } from "socket.io-client";

export default function AppointmentCallPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id as string;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sock = await getSocket();
        setSocket(sock);
      } catch (err) {
        console.error("Failed to connect to signaling server:", err);
        alert("Connection error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Connecting to appointment...</div>
      </div>
    );
  }

  if (!appointmentId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Invalid appointment ID</div>
      </div>
    );
  }

  return (
    <MeetingRoom
      roomId={`appointment-${appointmentId}`}
      socket={socket}
      onLeave={() => router.push("/appointments")}
    />
  );
}

