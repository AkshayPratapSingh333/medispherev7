"use client";

import { useParams } from "next/navigation";
import ChatWindow from "../../../../components/chat/ChatWindow";
import IncomingCallModal from "../../../../components/video/IncomingCallModal";

export default function PatientAppointmentChatPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div className="p-6">Missing appointment id</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Patient Chat</h1>
      <ChatWindow appointmentId={id} />
      
      {/* Incoming call modal */}
      <IncomingCallModal />
    </div>
  );
}
