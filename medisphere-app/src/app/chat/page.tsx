import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Chat</h1>
      <ChatWindow appointmentId="sample-id" />
    </div>
  );
}
