// src/lib/socket.ts
"use client";
import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

let socket: Socket | null = null;

function resolveSignalingUrl() {
  // Priority 1: Explicit environment variable (best for Vercel)
  const envUrl =
    process.env.NEXT_PUBLIC_SIGNALING_URL ||
    process.env.NEXT_PUBLIC_SIGNALING_SERVER;

  if (envUrl) {
    console.log("🔌 [Socket] Using env var URL:", envUrl);
    return envUrl;
  }

  // Priority 2: Production detection (use reliable fallback)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    
    if (!isLocalhost) {
      console.log("🔌 [Socket] Detected production hostname:", hostname, "- using fallback");
      return "https://medispherev7.onrender.com";
    }
  }

  // Priority 3: Local development
  console.log("🔌 [Socket] Using local development URL");
  return "http://localhost:4000";
}

export async function getSocket() {
  if (socket) return socket;
  const url = resolveSignalingUrl();
  console.log("🔌 Connecting to signaling server:", url);
  const session: Session | null = await getSession();
  const token = (session as Session & { sessionToken?: string; accessToken?: string })?.sessionToken || (session as Session & { sessionToken?: string; accessToken?: string })?.accessToken || "";
  socket = io(url, { 
    transports: ["polling", "websocket"],
    upgrade: true,
    timeout: 20000,
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
    console.warn("⚠️ Socket connection error:", err.message);
  });
  
  return socket;
}
