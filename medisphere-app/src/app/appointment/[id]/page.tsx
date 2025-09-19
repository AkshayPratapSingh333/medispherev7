import VideoCall from "../../../components/video/VideoCall";
import ChatWindow from "../../../components/chat/ChatWindow";

export default function AppointmentCallPage({ params }: { params: { id: string } }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 p-6">
      <VideoCall />
      <ChatWindow appointmentId={params.id} />
    </div>
  );
}
