import ChatWindow from "../../../../components/chat/ChatWindow";

export default function AppointmentChatPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ChatWindow appointmentId={params.id} />
      </div>
    </div>
  );
}
