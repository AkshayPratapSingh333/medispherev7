// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initSocketClient(token?: string, url?: string) {
  if (!socket) {
    const base = url ?? process.env.NEXT_PUBLIC_SIGNALING_URL ?? "http://localhost:4000";
    socket = io(base, {
      auth: { token: token ?? (typeof window !== "undefined" ? localStorage.getItem("socket_token") : "") },
      transports: ["websocket"],
    });
  }
  return socket;
}

export function getSocketClient() {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
