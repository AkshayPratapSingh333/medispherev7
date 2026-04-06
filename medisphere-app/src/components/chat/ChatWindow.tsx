"use client";

import { useEffect, useRef, useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import { getSocket } from "../../lib/socket";
import { useSession } from "next-auth/react";
import VideoCallPanel from "../../components/chat/VideoCallPanel";
import DoctorCallInitiator from "../video/DoctorCallInitiator";
import { toast } from "sonner";
import { incrementChatUnreadCount } from "@/lib/chat-unread";

type ChatMessage = {
  id: string;
  appointmentId: string;
  senderId: string;
  senderType: "DOCTOR" | "PATIENT";
  message: string;
  messageType: "text" | "image" | "file";
  timestamp: string;
};

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

function toToastDescription(message: ChatMessage) {
  if (message.messageType === "text") return message.message;
  const attachment = parseAttachment(message.message);
  if (!attachment) return message.message;
  return message.messageType === "image"
    ? `📷 ${attachment.fileName}`
    : `📎 ${attachment.fileName}`;
}

export default function ChatWindow({ appointmentId }: { appointmentId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inCall, setInCall] = useState(false);
  const joinedAppointmentRef = useRef<string | null>(null);

  // Check if current user is a doctor
  const isDoctor = session?.user?.role === "DOCTOR";

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
    let isMounted = true;

    const setupSocketListeners = async () => {
      const socket = await getSocket();
      if (!isMounted) return;

      if (joinedAppointmentRef.current !== appointmentId) {
        socket.emit("join", { appointmentId });
        joinedAppointmentRef.current = appointmentId;
      }

      const onMessage = ({ message }: { message: ChatMessage }) => {
        if (isMounted) {
          setMessages((m) => [...m, message]);

          // Show a visible popup for incoming messages from the other participant.
          if (message.senderId !== session?.user?.id) {
            incrementChatUnreadCount();
            const senderLabel =
              message.senderType === "DOCTOR" ? "Doctor" : "Patient";
            toast(`New message from ${senderLabel}`, {
              description: toToastDescription(message),
              duration: 5000,
            });
          }
        }
      };

      const onCallIncoming = () => {
        if (isMounted) setInCall(true);
      };

      const onCallEnded = () => {
        if (isMounted) setInCall(false);
      };

      socket.on("chat:message", onMessage);
      socket.on("call:incoming", onCallIncoming);
      socket.on("call:ended", onCallEnded);

      return () => {
        socket.off("chat:message", onMessage);
        socket.off("call:incoming", onCallIncoming);
        socket.off("call:ended", onCallEnded);
      };
    };

    const cleanup = setupSocketListeners();

    return () => {
      isMounted = false;
      cleanup?.then((fn) => fn?.());
    };
  }, [appointmentId, session?.user?.id]);

  // Send message (persist then broadcast)
  async function sendMessage(content: string) {
    const message = content.trim();
    if (!message) return;

    await persistAndBroadcast({
      message,
      messageType: "text",
    });
  }

  async function persistAndBroadcast(input: { message: string; messageType: "text" | "image" | "file" }) {
    if (!input.message.trim()) return;

    const res = await fetch(`/api/appointments/${appointmentId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input.message, messageType: input.messageType }),
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

  async function sendAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch(`/api/appointments/${appointmentId}/messages/upload`, {
      method: "POST",
      body: formData,
    });
    const uploadJson = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadJson?.error || "Failed to upload file");
    }

    const payload: AttachmentPayload = {
      fileName: uploadJson.fileName,
      fileUrl: uploadJson.fileUrl,
      mimeType: uploadJson.mimeType,
      fileSize: uploadJson.fileSize,
    };

    const messageType: "image" | "file" =
      uploadJson.messageType === "image" ? "image" : "file";

    await persistAndBroadcast({
      message: JSON.stringify(payload),
      messageType,
    });
  }

  return (
    <div className="flex flex-col border border-cyan-100 rounded-2xl h-full bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-cyan-100 px-4 py-3">
        <div className="font-semibold text-cyan-900">Appointment Chat</div>
        {isDoctor ? (
          // Doctor: Show call initiation button
          <DoctorCallInitiator appointmentId={appointmentId} />
        ) : (
          // Patient: Show manual call button
          <button
            onClick={() => setInCall(true)}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-1.5 text-white text-sm font-medium"
          >
            📞 Video Call
          </button>
        )}
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
      <ChatInput onSend={sendMessage} onSendAttachment={sendAttachment} />
    </div>
  );
}
