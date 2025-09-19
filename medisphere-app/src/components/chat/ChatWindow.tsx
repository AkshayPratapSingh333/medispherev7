"use client";
import { useState } from "react";
import ChatHistory from "../chat/ChatHistory";
import ChatInput from "../chat/ChatInput";

export default function ChatWindow({ appointmentId }: { appointmentId: string }) {
  const [messages, setMessages] = useState<any[]>([]);

  async function sendMessage(content: string) {
    const newMsg = { role: "user", content };
    setMessages((m) => [...m, newMsg]);

    const res = await fetch(`/api/appointments/${appointmentId}`, { cache: "no-store" });
    const appointment = await res.json();

    // TODO: socket.io emit (stub)
    const reply = { role: "doctor", content: "Reply (stubbed)" };
    setMessages((m) => [...m, reply]);
  }

  return (
    <div className="flex flex-col border rounded h-full">
      <ChatHistory messages={messages} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
