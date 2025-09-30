"use client";

import { useEffect, useRef, useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import { getSocket } from "../../lib/socket";
import { useSession } from "next-auth/react";
import VideoCallPanel from "../../components/chat/VideoCallPanel";

export default function ChatWindow({ appointmentId }: { appointmentId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [inCall, setInCall] = useState(false);
  const joinedRef = useRef(false);

  // Load history
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/appointments/${appointmentId}/messages`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    })();
  }, [appointmentId]);

  // Socket join + listeners
  useEffect(() => {
    (async () => {
      const socket = await getSocket();
      if (!joinedRef.current) {
        socket.emit("join", { appointmentId });
        joinedRef.current = true;
      }
      socket.on("chat:message", ({ message }) => {
        setMessages((m) => [...m, message]);
      });
      socket.on("call:incoming", () => setInCall(true));
      socket.on("call:ended", () => setInCall(false));

      return () => {
        socket.off("chat:message");
        socket.off("call:incoming");
        socket.off("call:ended");
      };
    })();
  }, [appointmentId]);

  // Send message (persist then broadcast)
  async function sendMessage(content: string) {
    const res = await fetch(`/api/appointments/${appointmentId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const msg = await res.json();
    if (res.ok) {
      setMessages((m) => [...m, msg]);
      const socket = await getSocket();
      socket.emit("chat:message", { appointmentId, message: msg });
    } else {
      alert(msg.error || "Failed to send message");
    }
  }

  return (
    <div className="flex flex-col border border-cyan-100 rounded-2xl h-full bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-cyan-100 px-4 py-3">
        <div className="font-semibold text-cyan-900">Appointment Chat</div>
        <button
          onClick={() => setInCall(true)}
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-1.5 text-white"
        >
          Video Call
        </button>
      </div>

      {inCall && (
        <div className="p-3 border-b border-cyan-100">
          <VideoCallPanel
  appointmentId={appointmentId}
  onClose={() => setInCall(false)}
  myId={session?.user?.id || "guest"}
/>

        </div>
      )}

      <ChatHistory messages={messages} currentUserId={session?.user?.id} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
