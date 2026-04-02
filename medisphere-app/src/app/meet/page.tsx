"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";

export default function MeetLobby() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media:", err);
      }
    })();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const createMeeting = () => {
    const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    stream?.getTracks().forEach((track) => track.stop());
    router.push(`/meet/${meetingId}`);
  };

  const joinWithCode = () => {
    const input = prompt("Enter meeting code or paste meeting link:");
    if (input) {
      const trimmed = input.trim();

      // Accept both:
      // 1) raw code: instant-123-abc
      // 2) full URL: http://localhost:3000/meet/instant-123-abc
      let roomCode = trimmed;
      try {
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          const parsed = new URL(trimmed);
          const parts = parsed.pathname.split("/").filter(Boolean);
          const meetIndex = parts.findIndex((p) => p === "meet");
          if (meetIndex !== -1 && parts[meetIndex + 1]) {
            roomCode = parts[meetIndex + 1];
          }
        }
      } catch {
        // If parsing fails, fallback to the raw input as room code.
      }

      if (!roomCode) {
        alert("Invalid meeting code/link.");
        return;
      }

      stream?.getTracks().forEach((track) => track.stop());
      router.push(`/meet/${roomCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        {/* Left: Preview */}
        <div className="bg-gray-800 rounded-2xl p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-6">Ready to join?</h2>
          
          <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-6 flex-1">
            {!isVideoOff ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-cyan-500 flex items-center justify-center text-white text-4xl font-bold">
                  {(name || "You").charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            <div className="flex gap-3 justify-center">
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full ${
                  isMuted ? "bg-red-500" : "bg-gray-700"
                } text-white hover:opacity-80 transition`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${
                  isVideoOff ? "bg-red-500" : "bg-gray-700"
                } text-white hover:opacity-80 transition`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              MediSphere Meet
            </h1>
            <p className="text-gray-400 text-lg">
              Premium video calls for your appointments
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={createMeeting}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition"
            >
              New Meeting
            </button>

            <button
              onClick={joinWithCode}
              className="w-full py-4 px-6 bg-gray-700 text-white rounded-xl font-semibold text-lg hover:bg-gray-600 transition"
            >
              Join with Code
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-white">Features:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Up to 50 participants
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> HD video & audio
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Screen sharing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> In-call messaging
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Shareable meeting links
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
