/**
 * useWebRTCPeer Hook
 * Handles WebRTC peer connection for 1-to-1 video calls
 * Doctor (initiator) creates offer, Patient (responder) creates answer
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "./use-socket";

const STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun2.l.google.com:19302",
  "stun:stun3.l.google.com:19302",
  "stun:stun4.l.google.com:19302",
];

export function useWebRTCPeer(meetingId: string, isInitiator: boolean) {
  const { emit, on, off, socket } = useSocket();

  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);

  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string>("new");
  const [iceConnectionState, setIceConnectionState] = useState<string>("new");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Create RTCPeerConnection
  const createPeerConnection = useCallback(() => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: STUN_SERVERS.map((url) => ({ urls: url })),
      });

      // Connection state changes
      peerConnection.onconnectionstatechange = () => {
        setConnectionState(peerConnection.connectionState);
        console.log("Connection state:", peerConnection.connectionState);

        if (peerConnection.connectionState === "connected") {
          setIsConnected(true);
          setError(null);
        } else if (peerConnection.connectionState === "failed") {
          setError("Connection failed. Please try again.");
          setIsConnected(false);
        } else if (peerConnection.connectionState === "disconnected") {
          setIsConnected(false);
        }
      };

      // ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        setIceConnectionState(peerConnection.iceConnectionState);
        console.log("ICE connection state:", peerConnection.iceConnectionState);
      };

      // Receive remote tracks
      peerConnection.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && remoteSocketIdRef.current) {
          emit("webrtc:ice-candidate", {
            meetingId,
            to: remoteSocketIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      return peerConnection;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create peer connection";
      setError(errorMsg);
      console.error("Error creating peer connection:", err);
      return null;
    }
  }, [emit, meetingId]);

  // Initialize connection
  const initializeConnection = useCallback(async () => {
    try {
      setError(null);

      // Get local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          autoGainControl: { ideal: true },
          noiseSuppression: { ideal: true },
          echoCancellation: { ideal: true },
        },
      });

      setLocalStream(stream);
      console.log("✅ Local stream acquired", { videoTracks: stream.getVideoTracks().length, audioTracks: stream.getAudioTracks().length });

      // Create peer connection
      const peer = createPeerConnection();
      if (!peer) {
        throw new Error("Failed to create peer connection");
      }

      peerConnectionRef.current = peer;
      console.log("✅ Peer connection created");

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log(`Adding ${track.kind} track to peer connection`);
        peer.addTrack(track, stream);
      });

      console.log("✅ Local tracks added to peer connection");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to initialize connection";
      setError(errorMsg);
      console.error("❌ Error initializing connection:", err);
    }
  }, [createPeerConnection]);

  // Handle remote offer (responder)
  const handleRemoteOffer = useCallback(
    async (offer: RTCSessionDescriptionInit, fromSocketId: string) => {
      try {
        if (!peerConnectionRef.current) {
          console.error("Peer connection not initialized");
          return;
        }

        remoteSocketIdRef.current = fromSocketId;

        // Set remote description
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        // Create answer
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        // Send answer
        emit("webrtc:answer", {
          meetingId,
          to: fromSocketId,
          answer,
        });

        console.log("Answer sent to initiator");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to handle offer: ${errorMsg}`);
        console.error("Error handling offer:", err);
      }
    },
    [emit, meetingId]
  );

  // Handle remote answer (initiator)
  const handleRemoteAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      try {
        if (!peerConnectionRef.current) {
          console.error("Peer connection not initialized");
          return;
        }

        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        console.log("✅ Answer received from responder");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to handle answer: ${errorMsg}`);
        console.error("Error handling answer:", err);
      }
    },
    []
  );

  // Handle ICE candidate
  const handleICECandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      try {
        if (!peerConnectionRef.current || !candidate) {
          return;
        }

        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        // Ignore errors for ICE candidates (some may fail)
        console.warn("Error adding ICE candidate:", err);
      }
    },
    []
  );

  // Listen for start-webrtc-exchange
  const handleStartExchange = useCallback(
    async ({ initiator, responder }: any) => {
      try {
        if (!peerConnectionRef.current) {
          throw new Error("Peer connection not initialized");
        }

        const currentUserSocketId = socket?.id;
        const isCurrentUserInitiator = initiator.socketId === currentUserSocketId;

        console.log("WebRTC Exchange Started:", {
          currentUserSocketId,
          initiatorId: initiator.socketId,
          responderId: responder.socketId,
          isCurrentUserInitiator,
        });

        if (isCurrentUserInitiator) {
          // Current user is initiator - create and send offer
          remoteSocketIdRef.current = responder.socketId;
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);

          emit("webrtc:offer", {
            meetingId,
            to: responder.socketId,
            offer,
          });

          console.log("✅ Offer sent to responder");
        } else {
          // Current user is responder - wait for offer
          remoteSocketIdRef.current = initiator.socketId;
          console.log("⏳ Responder waiting for offer from initiator");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to start exchange: ${errorMsg}`);
        console.error("Error starting WebRTC exchange:", err);
      }
    },
    [emit, meetingId, socket?.id]
  );

  // Setup effect
  useEffect(() => {
    let isMounted = true;
    let readyPromise: Promise<void> | null = null;

    const initialize = async () => {
      try {
        // Wait for socket to be connected
        const waitForSocket = () => {
          return new Promise<void>((resolve) => {
            if (socket?.connected) {
              resolve();
            } else {
              const checkInterval = setInterval(() => {
                if (socket?.connected) {
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 100);
            }
          });
        };

        await waitForSocket();
        if (!isMounted) return;

        // Initialize WebRTC connection
        await initializeConnection();
        if (!isMounted) return;

        // Now listen for WebRTC events
        on("webrtc:offer", ({ from, offer }) => {
          if (isMounted && peerConnectionRef.current) {
            console.log("📨 Received offer from", from);
            handleRemoteOffer(offer, from);
          }
        });

        on("webrtc:answer", ({ answer }) => {
          if (isMounted && peerConnectionRef.current) {
            console.log("📨 Received answer");
            handleRemoteAnswer(answer);
          }
        });

        on("webrtc:ice-candidate", ({ candidate }) => {
          if (isMounted && peerConnectionRef.current) {
            handleICECandidate(candidate);
          }
        });

        on("start-webrtc-exchange", (data) => {
          if (isMounted && peerConnectionRef.current) {
            console.log("🎬 Starting WebRTC exchange", data);
            handleStartExchange(data);
          }
        });
      } catch (err) {
        console.error("❌ Initialization error:", err);
      }
    };

    readyPromise = initialize() as Promise<void>;

    return () => {
      isMounted = false;
      // Cleanup
      localStream?.getTracks().forEach((track) => track.stop());
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      off("webrtc:offer");
      off("webrtc:answer");
      off("webrtc:ice-candidate");
      off("start-webrtc-exchange");
    };
  }, [
    initializeConnection,
    on,
    off,
    handleRemoteOffer,
    handleRemoteAnswer,
    handleICECandidate,
    handleStartExchange,
    socket,
    localStream,
  ]);

  // Control functions
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      const shouldMute = !isMuted;

      audioTracks.forEach((track) => {
        track.enabled = !shouldMute;
      });

      setIsMuted(shouldMute);

      // Notify others
      emit("participant-update", {
        meetingId,
        state: { isMuted: shouldMute },
      });
    }
  }, [localStream, isMuted, emit, meetingId]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const shouldTurnOff = !isVideoOff;

      videoTracks.forEach((track) => {
        track.enabled = !shouldTurnOff;
      });

      setIsVideoOff(shouldTurnOff);

      // Notify others
      emit("participant-update", {
        meetingId,
        state: { isVideoOff: shouldTurnOff },
      });
    }
  }, [localStream, isVideoOff, emit, meetingId]);

  const getStats = useCallback(async () => {
    if (!peerConnectionRef.current) return null;

    const stats = await peerConnectionRef.current.getStats();
    const result: any = {
      video: {},
      audio: {},
    };

    stats.forEach((report) => {
      if (report.type === "inbound-rtp") {
        if (report.kind === "video") {
          result.video.inbound = {
            bytesReceived: report.bytesReceived,
            packetsLost: report.packetsLost,
            frameRate: report.framesPerSecond,
          };
        } else if (report.kind === "audio") {
          result.audio.inbound = {
            bytesReceived: report.bytesReceived,
            packetsLost: report.packetsLost,
          };
        }
      } else if (report.type === "outbound-rtp") {
        if (report.kind === "video") {
          result.video.outbound = {
            bytesSent: report.bytesSent,
            frameRate: report.framesPerSecond,
          };
        } else if (report.kind === "audio") {
          result.audio.outbound = {
            bytesSent: report.bytesSent,
          };
        }
      }
    });

    return result;
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    connectionState,
    iceConnectionState,
    isMuted,
    isVideoOff,
    error,
    toggleMute,
    toggleVideo,
    getStats,
  };
}
