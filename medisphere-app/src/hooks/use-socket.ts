// hooks/use-socket.ts
"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(path?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const url = process.env.NEXT_PUBLIC_SIGNALING_URL || "http://localhost:4000";
      socketRef.current = io(url + (path || ""), {
        transports: ["websocket"],
        auth: {
          token: typeof window !== "undefined" ? (localStorage.getItem("socket_token") || "") : "",
        },
      });
    }

    const s = socketRef.current;
    return () => {
      s?.disconnect();
      socketRef.current = null;
    };
  }, [path]);

  return socketRef;
}
