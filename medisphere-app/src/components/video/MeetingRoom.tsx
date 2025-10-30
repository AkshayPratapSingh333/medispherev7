"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";
import { useMultiPeer } from "@/hooks/use-multi-peer";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  MessageSquare,
  Users,
  MoreVertical,
  Hand,
  Copy,
  Check,
} from "lucide-react";
import ConnectionDiagnostics from "./ConnectionDiagnostics";

interface Participant {
  socketId: string;
  userId: string;
  name: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  stream?: MediaStream;
  handRaised?: boolean;
}

interface ChatMessage {
  content: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}

interface MeetingRoomProps {
  roomId: string;
  socket: Socket | null;
  onLeave?: () => void;
}

export default function MeetingRoom({ roomId, socket, onLeave }: MeetingRoomProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { participants, myInfo, peersRef } = useMultiPeer(socket, roomId, localStream);

  // Join room when component mounts
  useEffect(() => {
    if (!socket) return;

    const userInfo = {
      userId: session?.user?.id || "guest",
      name: session?.user?.name || "Guest User",
    };

    socket.emit("join-room", { roomId, userInfo });

    return () => {
      socket.emit("leave-room", { roomId });
    };
  }, [socket, roomId, session]);

  // Initialize local media
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        alert("Could not access camera/microphone. Please check permissions.");
      }
    })();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      screenStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Listen for chat messages
  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = ({ message }: { message: ChatMessage }) => {
      setChatMessages((prev) => [...prev, message]);
    };

    socket.on("chat:message", handleChatMessage);
    return () => {
      socket.off("chat:message", handleChatMessage);
    };
  }, [socket]);

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socket?.emit("toggle-audio", { roomId, isMuted: !audioTrack.enabled });
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        socket?.emit("toggle-video", { roomId, isVideoOff: !videoTrack.enabled });
      }
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      socket?.emit("toggle-screen-share", { roomId, isScreenSharing: false });
      
      // Re-enable camera
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        setScreenStream(stream);
        setIsScreenSharing(true);
        socket?.emit("toggle-screen-share", { roomId, isScreenSharing: true });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
          socket?.emit("toggle-screen-share", { roomId, isScreenSharing: false });
          if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        };
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  // Leave meeting
  const handleLeave = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    screenStream?.getTracks().forEach((track) => track.stop());
    socket?.emit("leave-room", { roomId });
    onLeave?.();
    router.push("/appointments");
  };

  // Send chat message
  const sendMessage = () => {
    if (!messageInput.trim() || !socket) return;

    const message = {
      content: messageInput,
      senderId: session?.user?.id || "guest",
      senderName: session?.user?.name || "Guest",
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, message]);
    socket.emit("chat:message", { roomId, message });
    setMessageInput("");
  };

  // Copy meeting link
  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meet/${roomId}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Calculate grid layout
  const totalParticipants = participants.length + 1; // +1 for local user
  const gridCols = totalParticipants === 1 ? 1 : totalParticipants === 2 ? 2 : totalParticipants <= 4 ? 2 : 3;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main video area */}
      <div className="flex-1 flex flex-col">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div
            className="grid gap-4 h-full"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {/* Local video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-md text-white text-sm flex items-center gap-2">
                {myInfo?.name || "You"}
                {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
              </div>
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(myInfo?.name || "You").charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Remote participants */}
            {participants.map((participant: Participant) => (
              <ParticipantVideo key={participant.socketId} participant={participant} />
            ))}
          </div>
        </div>

        {/* Controls bar */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full ${
                isMuted ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
              } text-white transition`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${
                isVideoOff ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
              } text-white transition`}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full ${
                isScreenSharing ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
              } text-white transition`}
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </button>

            <button
              onClick={handleLeave}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
              title="Leave meeting"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={copyMeetingLink}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
              title="Copy meeting link"
            >
              {linkCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition relative"
              title="Participants"
            >
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalParticipants}
              </span>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
              title="Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat sidebar */}
      {showChat && (
        <div className="w-80 bg-white flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">In-call messages</h3>
            <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-medium text-gray-900">{msg.senderName}</div>
                <div className="text-gray-600">{msg.content}</div>
                <div className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Send a message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants sidebar */}
      {showParticipants && (
        <div className="w-80 bg-white flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Participants ({totalParticipants})
            </h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Local user */}
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-medium">
                {(myInfo?.name || "You").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{myInfo?.name || "You"} (me)</div>
              </div>
              {isMuted && <MicOff className="w-4 h-4 text-gray-400" />}
            </div>

            {/* Remote participants */}
            {participants.map((p: Participant) => (
              <div key={p.socketId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{p.name}</div>
                </div>
                {p.isMuted && <MicOff className="w-4 h-4 text-gray-400" />}
                {p.handRaised && <Hand className="w-4 h-4 text-yellow-500" />}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Connection Diagnostics */}
      <ConnectionDiagnostics socket={socket} roomId={roomId} peersRef={peersRef} />
    </div>
  );
}

// Participant video component
function ParticipantVideo({ participant }: { participant: Participant }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      {participant.stream && !participant.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
            {participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-md text-white text-sm flex items-center gap-2">
        {participant.name}
        {participant.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
        {participant.isScreenSharing && <Monitor className="w-4 h-4 text-blue-400" />}
      </div>
    </div>
  );
}
