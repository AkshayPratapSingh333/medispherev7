// src/lib/socket.ts
"use client";
import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";

let socket: Socket | null = null;
export async function getSocket() {
  if (socket) return socket;
  const url = process.env.NEXT_PUBLIC_SIGNALING_URL!;
  const session = await getSession();
  const token = (session as any)?.sessionToken || (session as any)?.accessToken || "";
  socket = io(url, { transports: ["websocket"], withCredentials: true, auth: { token, userId: session?.user?.id } });
  return socket;
}
