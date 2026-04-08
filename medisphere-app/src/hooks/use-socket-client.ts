import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

let socketInstance: Socket | null = null;

function getSignalingServerUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SIGNALING_URL ||
    process.env.NEXT_PUBLIC_SIGNALING_SERVER;

  if (envUrl) return envUrl;

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Production-safe fallback to hosted signaling service.
    return 'https://medispherev7.onrender.com';
  }

  return 'http://localhost:4000';
}

export function useSocketClient() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only create socket on client side
    if (typeof window === 'undefined') return;

    const signalingServer = getSignalingServerUrl();

    if (!socketInstance) {
      socketInstance = io(signalingServer, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: {
          token: session?.user?.email,
          userId: session?.user?.id,
          name: session?.user?.name,
          role: session?.user?.role,
        },
      });

      socketInstance.on('connect', () => {
        console.log('[Socket.io] Connected to signaling server');
      });

      socketInstance.on('disconnect', () => {
        console.log('[Socket.io] Disconnected from signaling server');
      });

      socketInstance.on('error', (error) => {
        console.error('[Socket.io] Error:', error);
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, [session]);

  const emit = useCallback(<T = unknown>(event: string, data?: T) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`[Socket.io] Not connected, cannot emit ${event}`);
    }
  }, []);

  const on = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  }, []);

  const once = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    if (socketRef.current) {
      socketRef.current.once(event, callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    once,
    isConnected: socketRef.current?.connected ?? false,
  };
}
