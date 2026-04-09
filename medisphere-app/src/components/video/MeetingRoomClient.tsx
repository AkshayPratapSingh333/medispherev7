"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import MeetingRoom from "@/components/video/MeetingRoom";

interface MeetingRoomClientProps {
  roomId: string;
  leavePath?: string;
}

export default function MeetingRoomClient({ roomId, leavePath = "/appointments" }: MeetingRoomClientProps) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const sock = await getSocket();
        if (!mounted) return;
        setSocket(sock);
      } catch (err) {
        console.error("Failed to connect to signaling server:", err);
        alert("Connection error. Please try again.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <div className="text-xl text-stone-900">Connecting to meeting...</div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <div className="text-xl text-stone-900">Invalid meeting ID</div>
      </div>
    );
  }

  return <MeetingRoom roomId={roomId} socket={socket} onLeave={() => router.push(leavePath)} />;
}
