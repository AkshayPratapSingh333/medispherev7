"use client";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

interface DiagnosticsProps {
  socket: Socket | null;
  roomId: string;
  peersRef: React.MutableRefObject<
    Map<string, { pc: { connectionState: RTCPeerConnectionState } }>
  >;
}

export default function ConnectionDiagnostics({ socket, roomId, peersRef }: DiagnosticsProps) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [peerStates, setPeerStates] = useState<Record<string, string>>({});
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    if (!socket) return;

    setSocketConnected(socket.connected);

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
    const handleRoomJoined = () => setRoomJoined(true);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room-joined", handleRoomJoined);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("room-joined", handleRoomJoined);
    };
  }, [socket]);

  useEffect(() => {
    const interval = setInterval(() => {
      const states: Record<string, string> = {};
      peersRef.current.forEach((peerData, socketId) => {
        states[socketId] = peerData.pc.connectionState;
      });
      setPeerStates(states);
    }, 1000);

    return () => clearInterval(interval);
  }, [peersRef]);

  if (!showDiagnostics) {
    return (
      <button
        onClick={() => setShowDiagnostics(true)}
        className="fixed bottom-4 left-4 px-3 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition z-50"
      >
        🔧 Diagnostics
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-xl shadow-2xl border-2 border-gray-300 p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Connection Diagnostics</h3>
        <button
          onClick={() => setShowDiagnostics(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-700">Socket Connected:</span>
          <span className={socketConnected ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
            {socketConnected ? "✓ Yes" : "✗ No"}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-700">Room Joined:</span>
          <span className={roomJoined ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
            {roomJoined ? "✓ Yes" : "⏳ Waiting"}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-700">Room ID:</span>
          <span className="text-gray-900 font-mono text-xs truncate max-w-[150px]" title={roomId}>
            {roomId}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-700">Peer Connections:</span>
          <span className="text-gray-900 font-semibold">
            {peersRef.current.size}
          </span>
        </div>

        {peersRef.current.size > 0 && (
          <div className="mt-3 border-t pt-3">
            <h4 className="font-semibold text-gray-900 mb-2">Peer States:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.entries(peerStates).map(([socketId, state]) => (
                <div key={socketId} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs">
                  <span className="text-gray-600 font-mono truncate max-w-[120px]" title={socketId}>
                    {socketId.slice(0, 8)}...
                  </span>
                  <span
                    className={`font-semibold ${
                      state === "connected"
                        ? "text-green-600"
                        : state === "connecting"
                        ? "text-yellow-600"
                        : state === "failed"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t">
          <button
            onClick={() => {
              console.log("=== DIAGNOSTICS ===");
              console.log("Socket:", socket);
              console.log("Room ID:", roomId);
              console.log("Peers:", Array.from(peersRef.current.entries()));
              alert("Check browser console for detailed diagnostics");
            }}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-xs"
          >
            Log to Console
          </button>
        </div>
      </div>
    </div>
  );
}
