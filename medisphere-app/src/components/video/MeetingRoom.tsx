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
  Hand,
  Copy,
  Check,
  Lock,
  Unlock,
  Shield,
  Smile,
  Radio,
} from "lucide-react";
import ConnectionDiagnostics from "./ConnectionDiagnostics";
import CollaborativeWhiteboard from "./CollaborativeWhiteboard";

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

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

interface QAItem {
  id: string;
  question: string;
  answer?: string;
  askedByName?: string;
}

interface MeetingState {
  hostSocketId: string | null;
  locked: boolean;
  waitingRoomEnabled: boolean;
  permissions: {
    canShareScreen: "all" | "host-only";
    canUnmuteSelf: "all" | "host-only";
  };
  waitingRoom: Array<{ socketId: string; name: string }>;
  breakoutRooms: Array<{ breakoutId: string; name: string; participants: string[] }>;
  polls: Poll[];
  qa: QAItem[];
  sharedNotes: string;
  recordingActive: boolean;
  captionsEnabled: boolean;
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
  const [showCollab, setShowCollab] = useState(false);
  const [showHostControls, setShowHostControls] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionBurst, setReactionBurst] = useState<Array<{ id: number; emoji: string; senderLabel: string }>>([]);
  const [meetingPassword, setMeetingPassword] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [captionFeed, setCaptionFeed] = useState<string[]>([]);
  const [transcriptFeed, setTranscriptFeed] = useState<string[]>([]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptionsText, setPollOptionsText] = useState("Yes\nNo");
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswerMap, setQaAnswerMap] = useState<Record<string, string>>({});
  const [sharedNotesDraft, setSharedNotesDraft] = useState("");
  const [meetingState, setMeetingState] = useState<MeetingState>({
    hostSocketId: null,
    locked: false,
    waitingRoomEnabled: false,
    permissions: {
      canShareScreen: "all",
      canUnmuteSelf: "all",
    },
    waitingRoom: [],
    breakoutRooms: [],
    polls: [],
    qa: [],
    sharedNotes: "",
    recordingActive: false,
    captionsEnabled: false,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const { participants, myInfo, peersRef } = useMultiPeer(socket, roomId, localStream);
  const isHost = !!socket?.id && meetingState.hostSocketId === socket.id;
  const emojiOptions = ["👍", "👏", "❤️", "😂", "🔥", "🎉", "🙌", "✅", "🙏", "😮"];

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

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
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        alert("Could not access camera/microphone. Please check permissions.");
      }
    })();

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
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

  useEffect(() => {
    if (!socket) return;

    const onMeetingState = (state: MeetingState) => {
      setMeetingState((prev) => ({ ...prev, ...state }));
      if (typeof state.sharedNotes === "string") {
        setSharedNotesDraft(state.sharedNotes);
      }
    };

    const onReaction = ({
      emoji,
      senderName,
      senderRole,
      isHost: senderIsHost,
    }: {
      emoji: string;
      senderName: string;
      senderRole?: string;
      isHost?: boolean;
    }) => {
      const id = Date.now() + Math.random();
      const roleLabel = senderIsHost
        ? "Host"
        : senderRole === "DOCTOR"
        ? "Doctor"
        : senderRole === "PATIENT"
        ? "Patient"
        : "Guest";
      const senderLabel = `${senderName} (${roleLabel})`;

      setReactionBurst((prev) => [...prev, { id, emoji, senderLabel }]);
      setTimeout(() => {
        setReactionBurst((prev) => prev.filter((r) => r.id !== id));
      }, 2400);
    };

    const onMuteAll = () => {
      if (!localStream) return;
      const audioTrack = localStream.getAudioTracks()[0];
      if (!audioTrack) return;
      audioTrack.enabled = false;
      setIsMuted(true);
    };

    const onPermissionDenied = ({ message }: { message: string }) => {
      alert(message || "Permission denied");
    };

    const onRemoved = () => {
      alert("Host removed you from the meeting.");
      router.push("/appointments");
    };

    const onCaptionsLine = ({ text, byName }: { text: string; byName: string }) => {
      setCaptionFeed((prev) => [...prev.slice(-12), `${byName}: ${text}`]);
    };

    const onTranscriptLine = ({ text, byName }: { text: string; byName: string }) => {
      setTranscriptFeed((prev) => [...prev.slice(-12), `${byName}: ${text}`]);
    };

    const onNotesUpdated = ({ content }: { content: string }) => {
      setSharedNotesDraft(content || "");
    };

    const onPollUpdated = ({ polls }: { polls: Poll[] }) => {
      setMeetingState((prev) => ({ ...prev, polls: polls || [] }));
    };

    const onQaUpdated = ({ qa }: { qa: QAItem[] }) => {
      setMeetingState((prev) => ({ ...prev, qa: qa || [] }));
    };

    socket.on("meeting:state", onMeetingState);
    socket.on("reaction:new", onReaction);
    socket.on("meeting:mute-all", onMuteAll);
    socket.on("meeting:permission-denied", onPermissionDenied);
    socket.on("meeting:removed", onRemoved);
    socket.on("captions:line", onCaptionsLine);
    socket.on("transcription:line", onTranscriptLine);
    socket.on("notes:updated", onNotesUpdated);
    socket.on("poll:updated", onPollUpdated);
    socket.on("qa:updated", onQaUpdated);

    return () => {
      socket.off("meeting:state", onMeetingState);
      socket.off("reaction:new", onReaction);
      socket.off("meeting:mute-all", onMuteAll);
      socket.off("meeting:permission-denied", onPermissionDenied);
      socket.off("meeting:removed", onRemoved);
      socket.off("captions:line", onCaptionsLine);
      socket.off("transcription:line", onTranscriptLine);
      socket.off("notes:updated", onNotesUpdated);
      socket.off("poll:updated", onPollUpdated);
      socket.off("qa:updated", onQaUpdated);
    };
  }, [socket, router, localStream]);

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      if (meetingState.permissions.canUnmuteSelf === "host-only" && isMuted && !isHost) {
        alert("Only host can unmute participants in this meeting.");
        return;
      }
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
    if (meetingState.permissions.canShareScreen === "host-only" && !isHost) {
      alert("Only the host can share screen in this meeting.");
      return;
    }

    if (isScreenSharing) {
      // Stop screen sharing
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      screenStreamRef.current = null;
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
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        socket?.emit("toggle-screen-share", { roomId, isScreenSharing: true });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          screenStreamRef.current = null;
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

  const toggleHandRaise = () => {
    const next = !handRaised;
    setHandRaised(next);
    socket?.emit("hand-raise:toggle", { roomId, raised: next });
  };

  const sendReaction = (emoji: string) => {
    socket?.emit("reaction:send", { roomId, emoji });
    setShowEmojiPicker(false);
  };

  const toggleLockMeeting = () => {
    socket?.emit("meeting:toggle-lock", { roomId, locked: !meetingState.locked });
  };

  const updateMeetingPassword = () => {
    socket?.emit("meeting:set-password", {
      roomId,
      password: meetingPassword.trim() ? meetingPassword.trim() : null,
    });
  };

  const toggleWaitingRoom = () => {
    socket?.emit("waiting-room:toggle", {
      roomId,
      enabled: !meetingState.waitingRoomEnabled,
    });
  };

  const muteAll = () => {
    socket?.emit("meeting:mute-all", { roomId });
  };

  const removeParticipant = (targetSocketId: string) => {
    socket?.emit("meeting:remove-participant", { roomId, targetSocketId });
  };

  const admitWaitingUser = (targetSocketId: string) => {
    socket?.emit("waiting-room:admit", { roomId, socketId: targetSocketId });
  };

  const denyWaitingUser = (targetSocketId: string) => {
    socket?.emit("waiting-room:deny", { roomId, socketId: targetSocketId });
  };

  const setPermission = (key: "canShareScreen" | "canUnmuteSelf", value: "all" | "host-only") => {
    socket?.emit("meeting:set-permission", { roomId, key, value });
  };

  const toggleRecording = () => {
    socket?.emit(meetingState.recordingActive ? "recording:stop" : "recording:start", { roomId });
  };

  const createSimpleBreakouts = () => {
    socket?.emit("breakout:create", { roomId, rooms: ["Breakout A", "Breakout B"] });
  };

  const assignToBreakout = (targetSocketId: string, breakoutId: string) => {
    socket?.emit("breakout:assign", { roomId, targetSocketId, breakoutId });
  };

  const createPoll = () => {
    const options = pollOptionsText
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);
    if (!pollQuestion.trim() || options.length < 2) {
      alert("Poll requires a question and at least 2 options.");
      return;
    }
    socket?.emit("poll:create", { roomId, question: pollQuestion.trim(), options });
    setPollQuestion("");
  };

  const votePoll = (pollId: string, optionIndex: number) => {
    socket?.emit("poll:vote", { roomId, pollId, optionIndex });
  };

  const askQuestion = () => {
    if (!qaQuestion.trim()) return;
    socket?.emit("qa:ask", { roomId, question: qaQuestion.trim() });
    setQaQuestion("");
  };

  const answerQuestion = (qaId: string) => {
    const answer = (qaAnswerMap[qaId] || "").trim();
    if (!answer) return;
    socket?.emit("qa:answer", { roomId, qaId, answer });
    setQaAnswerMap((prev) => ({ ...prev, [qaId]: "" }));
  };

  const pushNotes = () => {
    socket?.emit("notes:update", { roomId, content: sharedNotesDraft });
  };

  const toggleCaptions = () => {
    socket?.emit("captions:toggle", { roomId, enabled: !meetingState.captionsEnabled });
  };

  const sendCaption = () => {
    if (!captionInput.trim()) return;
    socket?.emit("captions:line", { roomId, text: captionInput.trim() });
    socket?.emit("transcription:line", { roomId, text: captionInput.trim() });
    setCaptionInput("");
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
          <div className="relative flex items-center gap-3">
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

            <button
              onClick={toggleHandRaise}
              className={`p-4 rounded-full ${handRaised ? "bg-yellow-500" : "bg-gray-700 hover:bg-gray-600"} text-white transition`}
              title="Raise hand"
            >
              <Hand className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
              title="Send reaction"
            >
              <Smile className="w-6 h-6" />
            </button>

            {showEmojiPicker && (
              <div className="absolute -top-16 left-1/2 z-30 -translate-x-1/2 rounded-xl border border-gray-600 bg-gray-900/95 px-2 py-2 shadow-2xl">
                <div className="flex items-center gap-1">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="rounded-md px-2 py-1 text-xl hover:bg-gray-700"
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={toggleRecording}
              disabled={!isHost}
              className={`p-4 rounded-full ${meetingState.recordingActive ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"} text-white transition disabled:opacity-50`}
              title="Recording"
            >
              <Radio className="w-6 h-6" />
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

            <button
              onClick={() => setShowCollab(!showCollab)}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
              title="Collaboration"
            >
              <Shield className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowHostControls(!showHostControls)}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
              title="Host controls"
            >
              {meetingState.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {reactionBurst.length > 0 && (
        <div className="pointer-events-none fixed right-6 top-6 z-50 space-y-2">
          {reactionBurst.map((reaction) => (
            <div
              key={reaction.id}
              className="animate-pulse rounded-full bg-black/70 px-3 py-2 text-sm text-white shadow"
            >
              {reaction.emoji} {reaction.senderLabel}
            </div>
          ))}
        </div>
      )}

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

      {showHostControls && (
        <div className="w-[360px] overflow-y-auto bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Host Controls</h3>
            <button onClick={() => setShowHostControls(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {!isHost && <p className="mb-3 rounded bg-amber-50 p-2 text-xs text-amber-700">Host-only actions are disabled for participants.</p>}

          <div className="space-y-3">
            <button
              disabled={!isHost}
              onClick={toggleLockMeeting}
              className="w-full rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {meetingState.locked ? "Unlock Meeting" : "Lock Meeting"}
            </button>

            <div className="rounded border p-2">
              <label className="text-xs font-medium text-gray-700">Meeting password</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={meetingPassword}
                  onChange={(e) => setMeetingPassword(e.target.value)}
                  placeholder="Set or clear password"
                  className="flex-1 rounded border px-2 py-1 text-sm"
                />
                <button
                  disabled={!isHost}
                  onClick={updateMeetingPassword}
                  className="rounded bg-cyan-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>

            <button
              disabled={!isHost}
              onClick={toggleWaitingRoom}
              className="w-full rounded bg-slate-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Waiting Room: {meetingState.waitingRoomEnabled ? "On" : "Off"}
            </button>

            <button
              disabled={!isHost}
              onClick={muteAll}
              className="w-full rounded bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Mute All
            </button>

            <div className="rounded border p-2">
              <p className="mb-2 text-xs font-medium text-gray-700">Participant permissions</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Screen share</span>
                  <select
                    disabled={!isHost}
                    value={meetingState.permissions.canShareScreen}
                    onChange={(e) => setPermission("canShareScreen", e.target.value as "all" | "host-only")}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="host-only">Host only</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unmute self</span>
                  <select
                    disabled={!isHost}
                    value={meetingState.permissions.canUnmuteSelf}
                    onChange={(e) => setPermission("canUnmuteSelf", e.target.value as "all" | "host-only")}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="host-only">Host only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded border p-2">
              <p className="mb-2 text-xs font-medium text-gray-700">Waiting room</p>
              {meetingState.waitingRoom.length === 0 ? (
                <p className="text-xs text-gray-500">No one is waiting.</p>
              ) : (
                <div className="space-y-2">
                  {meetingState.waitingRoom.map((person) => (
                    <div key={person.socketId} className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-gray-700">{person.name}</span>
                      <div className="flex gap-1">
                        <button
                          disabled={!isHost}
                          onClick={() => admitWaitingUser(person.socketId)}
                          className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
                        >
                          Admit
                        </button>
                        <button
                          disabled={!isHost}
                          onClick={() => denyWaitingUser(person.socketId)}
                          className="rounded bg-red-600 px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded border p-2">
              <p className="mb-2 text-xs font-medium text-gray-700">Remove participant</p>
              <div className="space-y-2">
                {participants.map((p: Participant) => (
                  <div key={p.socketId} className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-gray-700">{p.name}</span>
                    <button
                      disabled={!isHost}
                      onClick={() => removeParticipant(p.socketId)}
                      className="rounded bg-red-600 px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border p-2">
              <p className="mb-2 text-xs font-medium text-gray-700">Breakout rooms</p>
              <button
                disabled={!isHost}
                onClick={createSimpleBreakouts}
                className="mb-2 w-full rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                Create 2 breakout rooms
              </button>
              {meetingState.breakoutRooms.map((room) => (
                <div key={room.breakoutId} className="mb-2 rounded border p-2">
                  <p className="mb-1 text-xs font-semibold text-gray-700">{room.name}</p>
                  {participants.map((p: Participant) => (
                    <button
                      key={`${room.breakoutId}-${p.socketId}`}
                      disabled={!isHost}
                      onClick={() => assignToBreakout(p.socketId, room.breakoutId)}
                      className="mr-1 mb-1 rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-700 disabled:opacity-50"
                    >
                      Assign {p.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCollab && (
        <div className="w-[420px] overflow-y-auto bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Collaboration Tools</h3>
            <button onClick={() => setShowCollab(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Whiteboard</p>
              <CollaborativeWhiteboard socket={socket} roomId={roomId} />
            </div>

            <div className="rounded border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Polls</p>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Poll question"
                className="mb-2 w-full rounded border px-2 py-1 text-sm"
              />
              <textarea
                value={pollOptionsText}
                onChange={(e) => setPollOptionsText(e.target.value)}
                placeholder="One option per line"
                className="mb-2 h-16 w-full rounded border px-2 py-1 text-sm"
              />
              <button
                disabled={!isHost}
                onClick={createPoll}
                className="rounded bg-cyan-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                Create Poll
              </button>

              <div className="mt-3 space-y-2">
                {meetingState.polls.map((poll) => (
                  <div key={poll.id} className="rounded border p-2">
                    <p className="text-sm font-medium text-gray-800">{poll.question}</p>
                    <div className="mt-1 space-y-1">
                      {poll.options.map((option, idx) => (
                        <button
                          key={`${poll.id}-${idx}`}
                          onClick={() => votePoll(poll.id, idx)}
                          className="flex w-full items-center justify-between rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          <span>{option.text}</span>
                          <span>{option.votes}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Q&A</p>
              <div className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Ask a question"
                  className="flex-1 rounded border px-2 py-1 text-sm"
                />
                <button onClick={askQuestion} className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                  Ask
                </button>
              </div>
              <div className="space-y-2">
                {meetingState.qa.map((item) => (
                  <div key={item.id} className="rounded border p-2">
                    <p className="text-sm text-gray-800">Q: {item.question}</p>
                    {item.answer ? (
                      <p className="mt-1 text-xs text-emerald-700">A: {item.answer}</p>
                    ) : (
                      isHost && (
                        <div className="mt-2 flex gap-1">
                          <input
                            type="text"
                            value={qaAnswerMap[item.id] || ""}
                            onChange={(e) => setQaAnswerMap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Type answer"
                            className="flex-1 rounded border px-2 py-1 text-xs"
                          />
                          <button
                            onClick={() => answerQuestion(item.id)}
                            className="rounded bg-cyan-600 px-2 py-1 text-[11px] font-medium text-white"
                          >
                            Reply
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Shared Notes</p>
              <textarea
                value={sharedNotesDraft}
                onChange={(e) => setSharedNotesDraft(e.target.value)}
                onBlur={pushNotes}
                placeholder="Collaborative notes for this meeting"
                className="h-24 w-full rounded border px-2 py-1 text-sm"
              />
              <button onClick={pushNotes} className="mt-2 rounded bg-slate-700 px-3 py-1 text-xs font-medium text-white">
                Sync Notes
              </button>
            </div>

            <div className="rounded border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-gray-500">Live Captions / Transcription</p>
                <button
                  disabled={!isHost}
                  onClick={toggleCaptions}
                  className="rounded bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
                >
                  Captions: {meetingState.captionsEnabled ? "On" : "Off"}
                </button>
              </div>

              <div className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendCaption()}
                  placeholder="Type a caption/transcript line"
                  className="flex-1 rounded border px-2 py-1 text-sm"
                />
                <button onClick={sendCaption} className="rounded bg-cyan-600 px-3 py-1 text-xs font-medium text-white">
                  Send
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="h-24 overflow-y-auto rounded border p-2 text-xs">
                  <p className="mb-1 font-semibold text-gray-600">Captions</p>
                  {captionFeed.map((line, idx) => (
                    <p key={`c-${idx}`} className="text-gray-700">{line}</p>
                  ))}
                </div>
                <div className="h-24 overflow-y-auto rounded border p-2 text-xs">
                  <p className="mb-1 font-semibold text-gray-600">Transcript</p>
                  {transcriptFeed.map((line, idx) => (
                    <p key={`t-${idx}`} className="text-gray-700">{line}</p>
                  ))}
                </div>
              </div>
            </div>
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
