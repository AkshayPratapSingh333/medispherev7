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
  const [activePanel, setActivePanel] = useState<"chat" | "participants" | "collab" | "hostControls" | null>(null);
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
    }: {
      emoji: string;
      senderName: string;
      senderRole?: string;
      isHost?: boolean;
    }) => {
      const id = Date.now() + Math.random();
      const senderLabel = `${senderName}`;

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
    if (!isHost) {
      alert("Only the host can remove participants.");
      return;
    }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createSimpleBreakouts = () => {
    socket?.emit("breakout:create", { roomId, rooms: ["Breakout A", "Breakout B"] });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Helper to toggle panels exclusively
  const togglePanel = (panel: "chat" | "participants" | "collab" | "hostControls") => {
    setActivePanel(activePanel === panel ? null : panel);
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
    <div className="flex h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50">
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
            <div className="relative bg-stone-100 rounded-lg overflow-hidden">
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
                <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
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
        <div className="bg-stone-50 p-4 flex items-center justify-between border-t border-amber-200/40">
          <div className="flex items-center gap-2">
            <span className="text-stone-900 text-sm">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Center controls */}
          <div className="relative flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full ${
                isMuted ? "bg-red-500" : "bg-stone-200 hover:bg-stone-300"
              } text-stone-900 transition`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${
                isVideoOff ? "bg-red-500" : "bg-stone-200 hover:bg-stone-300"
              } text-stone-900 transition`}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full ${
                isScreenSharing ? "bg-blue-500" : "bg-stone-200 hover:bg-stone-300"
              } text-stone-900 transition`}
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
              className={`p-4 rounded-full ${handRaised ? "bg-yellow-500" : "bg-stone-200 hover:bg-stone-300"} text-stone-900 transition`}
              title="Raise hand"
            >
              <Hand className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-4 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-900 transition"
              title="Send reaction"
            >
              <Smile className="w-6 h-6" />
            </button>

            {showEmojiPicker && (
              <div className="absolute -top-16 left-1/2 z-30 -translate-x-1/2 rounded-xl border border-amber-200/50 bg-white/80 px-2 py-2 shadow-2xl">
                <div className="flex items-center gap-1">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="rounded-md px-2 py-1 text-xl hover:bg-stone-100"
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
              className={`p-4 rounded-full ${meetingState.recordingActive ? "bg-red-500" : "bg-stone-200 hover:bg-stone-300"} text-stone-900 transition disabled:opacity-50`}
              title="Recording"
            >
              <Radio className="w-6 h-6" />
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={copyMeetingLink}
              className="p-3 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-900 transition"
              title="Copy meeting link"
            >
              {linkCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>

            <button
              onClick={() => togglePanel("participants")}
              className="p-3 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-900 transition relative"
              title="Participants"
            >
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalParticipants}
              </span>
            </button>

            <button
              onClick={() => togglePanel("chat")}
              className="p-3 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-900 transition"
              title="Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={() => togglePanel("collab")}
              className="p-3 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-900 transition"
              title="Collaboration"
            >
              <Shield className="w-5 h-5" />
            </button>

            <button
              onClick={() => togglePanel("hostControls")}
              className="p-3 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-900 transition"
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
              className="animate-bounce rounded-full bg-gradient-to-r from-emerald-500/90 to-amber-500/90 backdrop-blur-md px-4 py-3 text-sm text-white shadow-lg border border-amber-200/50"
            >
              <span className="text-2xl mr-2">{reaction.emoji}</span>
              <span className="font-medium">{reaction.senderLabel}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chat sidebar */}
      {activePanel === "chat" && (
        <div className="w-96 bg-white/70 border-l border-amber-200/40 flex flex-col shadow-2xl shadow-amber-500/10">
          <div className="p-5 border-b border-amber-200/40 flex items-center justify-between backdrop-blur-sm bg-white/60">
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Chat
            </h3>
            <button 
              onClick={() => togglePanel("chat")} 
              className="text-stone-500 hover:text-stone-800 hover:bg-amber-100/40 rounded-lg p-1 transition"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 text-sm">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className="rounded-lg bg-white/50 backdrop-blur-sm border border-amber-200/40 p-3 hover:bg-white/70 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-stone-900 text-sm">{msg.senderName}</div>
                    <div className="text-xs text-stone-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-stone-700 text-sm break-words">{msg.content}</div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-amber-200/40 backdrop-blur-sm bg-white/60">
            <div className="flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-white/60 backdrop-blur-md border border-amber-200/40 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-amber-600 text-white rounded-lg hover:from-emerald-700 hover:to-amber-700 font-medium transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants sidebar */}
      {activePanel === "participants" && (
        <div className="w-96 bg-white/70 border-l border-amber-200/40 flex flex-col shadow-2xl shadow-amber-500/10">
          <div className="p-5 border-b border-amber-200/40 flex items-center justify-between backdrop-blur-sm bg-white/60">
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Participants ({totalParticipants})
            </h3>
            <button
              onClick={() => togglePanel("participants")}
              className="text-stone-500 hover:text-stone-800 hover:bg-amber-100/40 rounded-lg p-1 transition"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {/* Local user */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-amber-200/40 hover:bg-white/70 transition">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                {(myInfo?.name || "You").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900 text-sm truncate">{myInfo?.name || "You"}</div>
                <div className="text-xs text-emerald-700">You (Host)</div>
              </div>
              {isMuted && <MicOff className="w-4 h-4 text-orange-500 flex-shrink-0" />}
            </div>

            {/* Remote participants */}
            {participants.map((p: Participant) => (
              <div key={p.socketId} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-amber-200/40 hover:bg-white/70 transition group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-stone-900 text-sm truncate">{p.name}</div>
                  <div className="text-xs text-stone-500">Participant</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.isMuted && <MicOff className="w-4 h-4 text-orange-500" />}
                  {p.handRaised && <Hand className="w-4 h-4 text-amber-500" />}
                  {isHost && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${p.name} from meeting?`)) {
                          removeParticipant(p.socketId);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-orange-100 rounded text-orange-600 hover:text-orange-700 transition text-xs"
                      title="Remove participant"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePanel === "hostControls" && (
        <div className="w-96 overflow-y-auto bg-white/70 border-l border-amber-200/40 shadow-2xl shadow-amber-500/10">
          <div className="p-5 border-b border-amber-200/40 backdrop-blur-sm bg-white/60 flex items-center justify-between sticky top-0">
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              Host Controls
            </h3>
            <button 
              onClick={() => togglePanel("hostControls")} 
              className="text-stone-500 hover:text-stone-800 hover:bg-amber-100/40 rounded-lg p-1 transition"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            {!isHost && (
              <div className="rounded-lg bg-yellow-100 border border-yellow-300 p-3 text-xs text-yellow-900">
                ⚠️ Host-only features are disabled for participants.
              </div>
            )}

            <button
              disabled={!isHost}
              onClick={toggleLockMeeting}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {meetingState.locked ? "🔓 Unlock Meeting" : "🔒 Lock Meeting"}
            </button>

            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-amber-200/40 p-4">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Meeting Password</label>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={meetingPassword}
                  onChange={(e) => setMeetingPassword(e.target.value)}
                  placeholder="Set or clear password"
                  className="flex-1 rounded-lg bg-white/60 backdrop-blur-md border border-amber-200/40 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  disabled={!isHost}
                  onClick={updateMeetingPassword}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition"
                >
                  Save
                </button>
              </div>
            </div>

            <button
              disabled={!isHost}
              onClick={toggleWaitingRoom}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Waiting Room: {meetingState.waitingRoomEnabled ? "ON" : "OFF"}
            </button>

            <button
              disabled={!isHost}
              onClick={muteAll}
              className="w-full rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              🔇 Mute All Participants
            </button>

            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-amber-200/40 p-4">
              <p className="mb-3 text-xs font-bold text-stone-600 uppercase tracking-wide">Participant Permissions</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Screen Share</span>
                  <select
                    disabled={!isHost}
                    value={meetingState.permissions.canShareScreen}
                    onChange={(e) => setPermission("canShareScreen", e.target.value as "all" | "host-only")}
                    className="rounded-lg bg-white/60 border border-amber-200/40 px-2 py-1 text-xs text-stone-900 disabled:opacity-50"
                  >
                    <option value="all">All</option>
                    <option value="host-only">Host Only</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Unmute Self</span>
                  <select
                    disabled={!isHost}
                    value={meetingState.permissions.canUnmuteSelf}
                    onChange={(e) => setPermission("canUnmuteSelf", e.target.value as "all" | "host-only")}
                    className="rounded-lg bg-white/60 border border-amber-200/40 px-2 py-1 text-xs text-stone-900 disabled:opacity-50"
                  >
                    <option value="all">All</option>
                    <option value="host-only">Host Only</option>
                  </select>
                </div>
              </div>
            </div>

            {meetingState.waitingRoomEnabled && (
              <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-amber-200/40 p-4">
                <p className="mb-3 text-xs font-bold text-stone-600 uppercase tracking-wide">Waiting Room</p>
                {meetingState.waitingRoom.length === 0 ? (
                  <p className="text-xs text-stone-400">No one waiting.</p>
                ) : (
                  <div className="space-y-2">
                    {meetingState.waitingRoom.map((person) => (
                      <div key={person.socketId} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/40 border border-amber-200/40">
                        <span className="truncate text-xs text-stone-600">{person.name}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            disabled={!isHost}
                            onClick={() => admitWaitingUser(person.socketId)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50 transition"
                          >
                            ✓
                          </button>
                          <button
                            disabled={!isHost}
                            onClick={() => denyWaitingUser(person.socketId)}
                            className="rounded-lg bg-red-600 hover:bg-red-700 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50 transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-amber-200/40 p-4">
              <p className="mb-3 text-xs font-bold text-stone-600 uppercase tracking-wide">Remove Participant</p>
              {participants.length === 0 ? (
                <p className="text-xs text-stone-400">No participants.</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((p: Participant) => (
                    <div key={p.socketId} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/40 border border-amber-200/40 hover:bg-white/60 transition">
                      <span className="truncate text-xs text-stone-600">{p.name}</span>
                      <button
                        disabled={!isHost}
                        onClick={() => {
                          if (confirm(`Remove ${p.name} from meeting?`)) {
                            removeParticipant(p.socketId);
                          }
                        }}
                        className="rounded-lg bg-red-600 hover:bg-red-700 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activePanel === "collab" && (
        <div className="w-96 overflow-y-auto bg-white/70 border-l border-amber-200/40 shadow-2xl shadow-amber-500/10">
          <div className="p-5 border-b border-amber-200/40 backdrop-blur-sm bg-white/60 flex items-center justify-between sticky top-0">
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Collaboration
            </h3>
            <button 
              onClick={() => togglePanel("collab")} 
              className="text-stone-500 hover:text-stone-800 hover:bg-amber-100/40 rounded-lg p-1 transition"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4 custom-scrollbar">
            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-amber-200/40 p-4">
              <p className="mb-3 text-xs font-bold text-stone-600 uppercase tracking-wide">Whiteboard</p>
              <CollaborativeWhiteboard socket={socket} roomId={roomId} />
            </div>

            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-amber-200/40 p-4">
              <p className="mb-3 text-xs font-bold text-stone-600 uppercase tracking-wide">Polls</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Poll question"
                  className="w-full rounded-lg bg-white/60 border border-amber-200/40 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <textarea
                  value={pollOptionsText}
                  onChange={(e) => setPollOptionsText(e.target.value)}
                  placeholder="One option per line"
                  className="h-16 w-full rounded-lg bg-white/60 border border-amber-200/40 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  disabled={!isHost}
                  onClick={createPoll}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition w-full"
                >
                  Create Poll
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {meetingState.polls.map((poll) => (
                  <div key={poll.id} className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-sm font-semibold text-white mb-2">{poll.question}</p>
                    <div className="space-y-1">
                      {poll.options.map((option, idx) => (
                        <button
                          key={`${poll.id}-${idx}`}
                          onClick={() => votePoll(poll.id, idx)}
                          className="w-full flex items-center justify-between rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-xs text-gray-200 transition"
                        >
                          <span>{option.text}</span>
                          <span className="font-semibold text-emerald-400">{option.votes}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <p className="mb-3 text-xs font-bold text-gray-300 uppercase tracking-wide">Q&A</p>
              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Ask a question"
                  className="flex-1 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <button 
                  onClick={askQuestion} 
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition"
                >
                  Ask
                </button>
              </div>
              <div className="space-y-2">
                {meetingState.qa.map((item) => (
                  <div key={item.id} className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-sm text-gray-200">Q: {item.question}</p>
                    {item.answer ? (
                      <p className="mt-2 text-xs text-emerald-300">A: {item.answer}</p>
                    ) : (
                      isHost && (
                        <div className="mt-2 flex gap-1">
                          <input
                            type="text"
                            value={qaAnswerMap[item.id] || ""}
                            onChange={(e) => setQaAnswerMap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Type answer"
                            className="flex-1 rounded-lg bg-white/10 border border-white/20 px-2 py-1 text-xs text-white placeholder-gray-400 focus:outline-none"
                          />
                          <button
                            onClick={() => answerQuestion(item.id)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white transition"
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

            <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <p className="mb-3 text-xs font-bold text-gray-300 uppercase tracking-wide">Shared Notes</p>
              <textarea
                value={sharedNotesDraft}
                onChange={(e) => setSharedNotesDraft(e.target.value)}
                onBlur={pushNotes}
                placeholder="Collaborative notes for this meeting"
                className="h-24 w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button 
                onClick={pushNotes} 
                className="mt-3 w-full rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2 text-xs font-semibold text-white transition"
              >
                Sync Notes
              </button>
            </div>

            <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">Captions / Transcription</p>
                <button
                  disabled={!isHost}
                  onClick={toggleCaptions}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50 transition"
                >
                  {meetingState.captionsEnabled ? "ON" : "OFF"}
                </button>
              </div>
              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendCaption()}
                  placeholder="Type a caption..."
                  className="flex-1 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <button 
                  onClick={sendCaption} 
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition"
                >
                  Send
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-20 overflow-y-auto rounded-lg bg-white/5 border border-white/10 p-2 custom-scrollbar">
                  <p className="mb-1 text-xs font-semibold text-emerald-300">Captions</p>
                  {captionFeed.map((line, idx) => (
                    <p key={`c-${idx}`} className="text-[11px] text-gray-300">{line}</p>
                  ))}
                </div>
                <div className="h-20 overflow-y-auto rounded-lg bg-white/5 border border-white/10 p-2 custom-scrollbar">
                  <p className="mb-1 text-xs font-semibold text-emerald-300">Transcript</p>
                  {transcriptFeed.map((line, idx) => (
                    <p key={`t-${idx}`} className="text-[11px] text-gray-300">{line}</p>
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
