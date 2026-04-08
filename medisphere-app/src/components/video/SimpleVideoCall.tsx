"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/use-socket";
import { useWebRTCPeer } from "@/hooks/use-webrtc-peer";
import { Button } from "@/components/ui/button";

export function SimpleVideoCall({ appointmentId }: { appointmentId: string }) {
  const { data: session } = useSession();
  const { emit } = useSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Determine if current user is initiator (doctor starts call)
  const isDoctor = session?.user?.role === "DOCTOR";

  const { localStream, remoteStream, isConnected, error, connectionState, iceConnectionState, toggleMute, toggleVideo } =
    useWebRTCPeer(appointmentId, isDoctor);

  // Join the meeting room
  useEffect(() => {
    if (!session?.user) return;

    console.log("📍 Joining meeting:", { appointmentId, userId: session.user.id, role: session.user.role });
    
    emit("join-meeting", {
      meetingId: appointmentId,
      meetingData: {
        appointmentId,
        startTime: new Date(),
      },
    });

    // Cleanup on unmount
    return () => {
      emit("leave-meeting", { meetingId: appointmentId });
    };
  }, [appointmentId, emit, session?.user]);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log("✅ Local stream attached to video element", { tracks: localStream.getTracks().length });
      setDebugInfo((prev) => prev + "\n✅ Local stream attached");
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log("✅ Remote stream attached to video element", { tracks: remoteStream.getTracks().length });
      setDebugInfo((prev) => prev + "\n✅ Remote stream attached");
    }
  }, [remoteStream]);

  // Track connection state changes
  useEffect(() => {
    console.log("🔌 Connection state:", { connectionState, iceConnectionState, isConnected });
    setDebugInfo((prev) => `Connection: ${connectionState}\nICE: ${iceConnectionState}\nConnected: ${isConnected ? "Yes" : "No"}`);
  }, [connectionState, iceConnectionState, isConnected]);

  // Toggle mute handler
  const handleToggleMute = () => {
    toggleMute();
    setIsMuted(!isMuted);
  };

  // Toggle video handler
  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoOff(!isVideoOff);
  };

  // End call
  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    window.location.href = `/appointments/${appointmentId}`;
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* Debug Info */}
      {error && (
        <div className="bg-red-900 text-red-100 p-4 text-sm">
          <div className="font-bold">Error:</div>
          <div>{error}</div>
        </div>
      )}
      
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded-lg text-white text-sm font-medium">
            {isDoctor ? "Doctor (You)" : "Patient (You)"}
          </div>
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <span className="text-white text-lg">📹 Camera is off</span>
            </div>
          )}
          {!localStream && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <span className="text-white text-lg">⏳ Loading camera...</span>
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded-lg text-white text-sm font-medium">
            {isDoctor ? "Patient" : "Doctor"}
          </div>
          {!isConnected && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <span className="text-white text-lg block mb-2">⏳ Connecting...</span>
                <span className="text-gray-400 text-sm whitespace-pre-wrap">{debugInfo}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-700 p-6 flex justify-center gap-6">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          onClick={handleToggleMute}
          className="gap-2 px-6 py-2"
          size="lg"
        >
          {isMuted ? "🔇 Unmute" : "🎤 Mute"}
        </Button>

        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          onClick={handleToggleVideo}
          className="gap-2 px-6 py-2"
          size="lg"
        >
          {isVideoOff ? "📹 Turn on camera" : "📹 Turn off camera"}
        </Button>

        <Button
          variant="destructive"
          onClick={handleEndCall}
          className="gap-2 px-6 py-2"
          size="lg"
        >
          ❌ End Call
        </Button>
      </div>
    </div>
  );
}
