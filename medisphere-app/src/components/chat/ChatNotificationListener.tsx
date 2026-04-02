"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import { incrementChatUnreadCount } from "@/lib/chat-unread";

type ChatMessage = {
  senderId?: string;
  senderType?: "DOCTOR" | "PATIENT";
  message?: string;
};

type Appointment = { id: string };

function isChatRoute(pathname: string): boolean {
  return pathname === "/chat" || /\/appointments\/[^/]+\/chat$/.test(pathname);
}

export default function ChatNotificationListener() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    let active = true;
    let detach: (() => void) | null = null;

    const setup = async () => {
      const socket = await getSocket();
      if (!active) return;

      try {
        const res = await fetch("/api/appointments", { cache: "no-store" });
        if (res.ok) {
          const appts = (await res.json()) as Appointment[];
          appts.forEach((a) => {
            if (a?.id) socket.emit("join", { appointmentId: a.id });
          });
        }
      } catch (err) {
        console.warn("Unable to preload chat rooms for notifications", err);
      }

      const onIncomingMessage = ({ message }: { message: ChatMessage }) => {
        if (!message) return;
        if (message.senderId === session.user.id) return;

        const inChat = isChatRoute(window.location.pathname);
        if (inChat) return;

        incrementChatUnreadCount();
        const sender = message.senderType === "DOCTOR" ? "Doctor" : "Patient";
        toast("New chat message", {
          description: `${sender}: ${message.message || "New message"}`,
          duration: 5000,
        });
      };

      socket.on("chat:message", onIncomingMessage);
      detach = () => {
        socket.off("chat:message", onIncomingMessage);
      };
    };

    void setup();

    return () => {
      active = false;
      detach?.();
    };
  }, [session?.user?.id, status]);

  return null;
}
