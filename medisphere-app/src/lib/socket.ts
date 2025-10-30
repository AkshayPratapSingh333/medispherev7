// src/lib/socket.ts
"use client";
import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";

let socket: Socket | null = null;
export async function getSocket() {
  if (socket) return socket;
  const url = process.env.NEXT_PUBLIC_SIGNALING_URL || "http://localhost:4000";
  console.log("🔌 Connecting to signaling server:", url);
  const session = await getSession();
  const token = (session as any)?.sessionToken || (session as any)?.accessToken || "";
  socket = io(url, { 
    transports: ["websocket", "polling"], 
    withCredentials: true, 
    auth: { token, userId: session?.user?.id },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });
  
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });
  
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });
  
  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });
  
  return socket;
}
