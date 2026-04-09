// hooks/use-socket.ts
"use client";
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type QueuedEmit = {
  event: string;
  data: unknown;
};

const socketByPath = new Map<string, Socket>();
const pendingByPath = new Map<string, QueuedEmit[]>();

function getPathKey(path?: string) {
  return path || "";
}

function resolveSignalingUrl() {
  // Priority 1: Explicit environment variable
  const envUrl =
    process.env.NEXT_PUBLIC_SIGNALING_URL ||
    process.env.NEXT_PUBLIC_SIGNALING_SERVER;

  if (envUrl) {
    console.log("[Socket.io] Using env var URL:", envUrl);
    return envUrl;
  }

  // Priority 2: Production detection (use reliable fallback)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    
    if (!isLocalhost) {
      console.log("[Socket.io] Detected production hostname:", hostname, "- using fallback server");
      return "https://medispherev7.onrender.com";
    }
  }

  // Priority 3: Local development
  console.log("[Socket.io] Using local development URL");
  return "http://localhost:4000";
}

function createSocket(path?: string) {
  const url = resolveSignalingUrl();
  const key = getPathKey(path);
  const existing = socketByPath.get(key);
  if (existing) return existing;

  const socket = io(url + key, {
    transports: ["polling", "websocket"],
    upgrade: true,
    timeout: 20000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 20,
    withCredentials: true,
    auth: {
      token: typeof window !== "undefined" ? localStorage.getItem("socket_token") || "" : "",
    },
  });

  socket.on("connect", () => {
    const queue = pendingByPath.get(key) || [];
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      socket.emit(item.event, item.data);
    }
    pendingByPath.set(key, queue);
    console.log("[Socket.io] Connected:", socket.id, "path:", key || "/");
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.io] Disconnected:", reason, "path:", key || "/");
  });

  socket.on("connect_error", (error) => {
    console.warn("[Socket.io] Connection error:", error?.message || error);
  });

  socketByPath.set(key, socket);
  if (!pendingByPath.has(key)) {
    pendingByPath.set(key, []);
  }

  return socket;
}

export function useSocket(path?: string) {
  const socketRef = useRef<Socket | null>(null);
  const pathKeyRef = useRef<string>(getPathKey(path));

  useEffect(() => {
    pathKeyRef.current = getPathKey(path);
    socketRef.current = createSocket(path);

    return () => {
      // Keep singleton connection alive across component lifecycles.
    };
  }, [path]);

  // Helper methods
  const emit = useCallback(<T = unknown>(event: string, data: T) => {
    const socket = socketRef.current;
    const key = pathKeyRef.current;
    if (socket?.connected) {
      socket.emit(event, data);
      return;
    }

    const queue = pendingByPath.get(key) || [];
    queue.push({ event, data });
    pendingByPath.set(key, queue);

    if (socket && !socket.connected) {
      socket.connect();
    }
  }, []);

  const on = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const off = useCallback(<T = unknown>(event: string, callback?: (data: T) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  const socket = socketRef.current;

  return {
    emit,
    on,
    off,
    socket,
    isConnected: socket?.connected || false,
  };
}
