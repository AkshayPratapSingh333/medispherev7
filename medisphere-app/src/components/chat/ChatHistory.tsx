"use client";

export default function ChatHistory({
  messages,
  currentUserId,
}: {
  messages: Array<{
    id?: string;
    senderId: string;
    senderType: "DOCTOR" | "PATIENT";
    message: string;
    timestamp?: string;
  }>;
  currentUserId?: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-br from-cyan-50 to-emerald-50">
      {messages.map((m) => {
        const mine = m.senderId === currentUserId;
        return (
          <div key={m.id || `${m.senderId}-${m.timestamp}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                mine
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                  : "bg-white ring-1 ring-cyan-100 text-cyan-900"
              }`}
            >
              {m.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
