"use client";

import Image from "next/image";

type AttachmentPayload = {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
};

function parseAttachment(message: string): AttachmentPayload | null {
  try {
    const parsed = JSON.parse(message) as AttachmentPayload;
    if (!parsed?.fileName || !parsed?.fileUrl) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function ChatHistory({
  messages,
  currentUserId,
}: {
  messages: Array<{
    id?: string;
    senderId: string;
    senderType: "DOCTOR" | "PATIENT";
    message: string;
    messageType?: "text" | "image" | "file";
    timestamp?: string;
  }>;
  currentUserId?: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-br from-emerald-50 to-emerald-50">
      {messages.map((m) => {
        const mine = m.senderId === currentUserId;
        const attachment =
          m.messageType === "image" || m.messageType === "file"
            ? parseAttachment(m.message)
            : null;

        return (
          <div key={m.id || `${m.senderId}-${m.timestamp}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                mine
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                  : "bg-white ring-1 ring-emerald-200 text-emerald-900"
              }`}
            >
              {m.messageType === "image" && attachment ? (
                <div className="space-y-2">
                  <Image
                    src={attachment.fileUrl}
                    alt={attachment.fileName}
                    width={260}
                    height={180}
                    unoptimized
                    className="rounded-lg object-cover"
                  />
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs underline ${mine ? "text-white/90" : "text-emerald-700"}`}
                  >
                    {attachment.fileName}
                  </a>
                </div>
              ) : m.messageType === "file" && attachment ? (
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`underline ${mine ? "text-white" : "text-emerald-700"}`}
                >
                  📎 {attachment.fileName}
                </a>
              ) : (
                m.message
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
