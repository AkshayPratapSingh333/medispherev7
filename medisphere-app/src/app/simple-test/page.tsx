"use client";

import { useEffect, useRef, useState } from "react";
import { useMultiPeer } from "@/hooks/use-multi-peer";
import { io, Socket } from "socket.io-client";

export default function SimpleTest() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId] = useState("test-room-123");
  const [userName, setUserName] = useState("");
  const [joined, setJoined] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize socket
  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Use the multi-peer hook
  const { participants } = useMultiPeer(socket, roomId, localStream);

  // Get local media
  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      console.log("✅ Got local stream:", stream.getTracks().map(t => t.kind));
    } catch (err) {
      console.error("❌ Error getting media:", err);
    }
  };

  const handleJoin = () => {
    if (!userName || !localStream || !socket) return;
    console.log(`🚀 Joining room "${roomId}" as "${userName}"`);
    socket.emit("join-room", { roomId, name: userName });
    setJoined(true);
  };

  const handleLeave = () => {
    console.log("👋 Leaving room");
    socket?.emit("leave-room", { roomId });
    setJoined(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔬 Simple WebRTC Test</h1>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Controls</h2>
          
          {!localStream ? (
            <button
              onClick={startMedia}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
            >
              📹 Start Camera & Mic
            </button>
          ) : !joined ? (
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Your Name:</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-gray-700 px-4 py-2 rounded w-64"
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={!userName}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
              >
                🚀 Join Room "{roomId}"
              </button>
            </div>
          ) : (
            <button
              onClick={handleLeave}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
            >
              👋 Leave Room
            </button>
          )}
        </div>

        {/* Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <div>Socket: {socket?.connected ? "✅ Connected" : "❌ Disconnected"}</div>
            <div>Socket ID: {socket?.id || "N/A"}</div>
            <div>Room: {joined ? `✅ Joined "${roomId}"` : "❌ Not joined"}</div>
            <div>Local Stream: {localStream ? "✅ Active" : "❌ Not started"}</div>
            <div>Participants: {participants.length}</div>
          </div>
        </div>

        {/* Videos */}
        <div className="grid grid-cols-2 gap-4">
          {/* Local Video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 font-semibold">
              📹 You ({userName || "Not joined"})
            </div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full aspect-video bg-black"
            />
          </div>

          {/* Remote Videos */}
          {participants.map((participant) => (
            <div key={participant.socketId} className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 font-semibold">
                👤 {participant.name}
                <span className="ml-2 text-sm">
                  {participant.stream ? "✅ Connected" : "⏳ Connecting..."}
                </span>
              </div>
              <video
                ref={(el) => {
                  if (el && participant.stream) {
                    el.srcObject = participant.stream;
                  }
                }}
                autoPlay
                playsInline
                className="w-full aspect-video bg-black"
              />
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">📋 How to Test</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open this page in one browser window (Doctor)</li>
            <li>Click "Start Camera & Mic" and allow permissions</li>
            <li>Enter your name (e.g., "Doctor") and click "Join Room"</li>
            <li>Open this page in another window/browser (Patient) - use Incognito or different browser</li>
            <li>Repeat steps 2-3 with a different name (e.g., "Patient")</li>
            <li>You should see each other's video within 5 seconds</li>
            <li><strong>OPEN BROWSER CONSOLE (F12)</strong> to see detailed connection logs</li>
          </ol>
          <div className="mt-4 p-4 bg-yellow-950 rounded">
            <strong>What to look for in console:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>🚀 "Joining room..." messages</li>
              <li>🔥 "Initiating connection to..." messages</li>
              <li>🤝 "Negotiation needed" messages</li>
              <li>📤 "Sending offer" messages</li>
              <li>📥 "Received offer/answer" messages</li>
              <li>🧊 "Added ICE candidate" messages</li>
              <li>📹 "Received remote track" messages</li>
              <li>🔌 "Connection state" changes (should end at "connected")</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
