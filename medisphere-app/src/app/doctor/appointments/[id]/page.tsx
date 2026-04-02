"use client";

import { useParams } from "next/navigation";
import ChatWindow from "../../../../components/chat/ChatWindow";

export default function DoctorAppointmentChatPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div className="p-6">Missing appointment id</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Doctor Chat</h1>
      <ChatWindow appointmentId={id} />
    </div>
  );
}
