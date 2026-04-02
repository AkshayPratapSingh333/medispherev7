"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

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

interface PeerConnection {
  pc: RTCPeerConnection;
  makingOffer: boolean;
  ignoreOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  pendingCandidates: RTCIceCandidateInit[];
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function useMultiPeer(
  socket: Socket | null,
  roomId: string,
  localStream: MediaStream | null
) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myInfo, setMyInfo] = useState<Participant | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const politeRef = useRef<Set<string>>(new Set()); // Track which peers we're polite to
  const initiatorTargetsRef = useRef<Set<string>>(new Set());

  const createAndSendOffer = useCallback(
    async (remoteSocketId: string) => {
      const peerData = peersRef.current.get(remoteSocketId);
      if (!peerData || !socket) return;

      const { pc } = peerData;
      if (peerData.makingOffer) return;
      if (pc.signalingState !== "stable") return;

      try {
        peerData.makingOffer = true;
        const offer = await pc.createOffer();

        // Signaling state can change while awaiting createOffer.
        if (pc.signalingState !== "stable") return;

        await pc.setLocalDescription(offer);
        socket.emit("webrtc:offer", {
          roomId,
          targetSocketId: remoteSocketId,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.error(`❌ Failed creating offer for ${remoteSocketId}:`, err);
      } finally {
        peerData.makingOffer = false;
      }
    },
    [socket, roomId]
  );

  // Create or get peer connection for a specific socket
  const getOrCreatePeer = useCallback(
    (remoteSocketId: string): RTCPeerConnection => {
      if (peersRef.current.has(remoteSocketId)) {
        return peersRef.current.get(remoteSocketId)!.pc;
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peersRef.current.set(remoteSocketId, {
        pc,
        makingOffer: false,
        ignoreOffer: false,
        isSettingRemoteAnswerPending: false,
        pendingCandidates: [],
      });

      // Add local tracks to this peer
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle incoming remote tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        console.log(`📹 Received remote track from ${remoteSocketId}:`, event.track.kind);
        console.log(`   Stream has ${remoteStream.getTracks().length} tracks`);
        setParticipants((prev) =>
          prev.map((p) =>
            p.socketId === remoteSocketId
              ? { ...p, stream: remoteStream }
              : p
          )
        );
      };

      // ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log(`🧊 ICE connection state with ${remoteSocketId}: ${pc.iceConnectionState}`);
      };

      // Send ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtc:ice", {
            roomId,
            targetSocketId: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Deterministic initial negotiation avoids glare and invalid signaling states.
      pc.onnegotiationneeded = () => {
        if (initiatorTargetsRef.current.has(remoteSocketId)) {
          void createAndSendOffer(remoteSocketId);
        }
      };

      // Connection state monitoring
      pc.onconnectionstatechange = () => {
        console.log(`🔌 Connection state with ${remoteSocketId}: ${pc.connectionState}`);
        if (pc.connectionState === "failed") {
          pc.restartIce();
        }
      };

      return pc;
    },
    [socket, roomId, localStream, createAndSendOffer]
  );

  // Handle incoming WebRTC offer
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({
      fromSocketId,
      sdp,
    }: {
      fromSocketId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (!sdp || sdp.type !== "offer") {
        return;
      }
      console.log(`📥 Received ${sdp.type} from ${fromSocketId}`);
      const pc = getOrCreatePeer(fromSocketId);
      const peerData = peersRef.current.get(fromSocketId);
      if (!peerData) return;

      const polite = politeRef.current.has(fromSocketId);
      const readyForOffer =
        !peerData.makingOffer &&
        (pc.signalingState === "stable" || peerData.isSettingRemoteAnswerPending);
      const offerCollision = !readyForOffer;

      peerData.ignoreOffer = !polite && offerCollision;
      if (peerData.ignoreOffer) {
        console.log(`⚠️ Ignoring offer from ${fromSocketId} (collision, not polite)`);
        return;
      }

      try {
        if (offerCollision && polite) {
          if (pc.signalingState === "have-local-offer") {
            await Promise.all([
              pc.setLocalDescription({ type: "rollback" }),
              pc.setRemoteDescription(sdp),
            ]);
          } else {
            await pc.setRemoteDescription(sdp);
          }
        } else {
          await pc.setRemoteDescription(sdp);
        }

        if (peerData.pendingCandidates.length > 0) {
          for (const queued of peerData.pendingCandidates) {
            try {
              await pc.addIceCandidate(queued);
            } catch (err) {
              console.warn(`⚠️ Ignored queued ICE for ${fromSocketId}:`, err);
            }
          }
          peerData.pendingCandidates = [];
        }

        if (sdp.type === "offer") {
          if (pc.signalingState !== "have-remote-offer") {
            console.warn(`⚠️ Cannot answer ${fromSocketId}; signaling state is ${pc.signalingState}`);
            return;
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log(`📤 Sending answer to ${fromSocketId}`);
          socket.emit("webrtc:answer", {
            roomId,
            targetSocketId: fromSocketId,
            sdp: pc.localDescription,
          });
        }
      } catch (err) {
        console.error(`❌ Error handling offer from ${fromSocketId}:`, err);
      }
    };

    socket.on("webrtc:offer", handleOffer);
    return () => {
      socket.off("webrtc:offer", handleOffer);
    };
  }, [socket, roomId, getOrCreatePeer]);

  // Handle incoming WebRTC answer
  useEffect(() => {
    if (!socket) return;

    const handleAnswer = async ({
      fromSocketId,
      sdp,
    }: {
      fromSocketId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (!sdp || sdp.type !== "answer") {
        return;
      }
      console.log(`📥 Received answer from ${fromSocketId}`);
      const peerData = peersRef.current.get(fromSocketId);
      if (!peerData) {
        console.warn(`⚠️ No peer data for ${fromSocketId}`);
        return;
      }

      try {
        if (peerData.pc.signalingState !== "have-local-offer") {
          console.warn(`⚠️ Skipping answer from ${fromSocketId}; signaling state is ${peerData.pc.signalingState}`);
          return;
        }
        peerData.isSettingRemoteAnswerPending = true;
        await peerData.pc.setRemoteDescription(sdp);

        if (peerData.pendingCandidates.length > 0) {
          for (const queued of peerData.pendingCandidates) {
            try {
              await peerData.pc.addIceCandidate(queued);
            } catch (err) {
              console.warn(`⚠️ Ignored queued ICE for ${fromSocketId}:`, err);
            }
          }
          peerData.pendingCandidates = [];
        }

        console.log(`✅ Set remote description for ${fromSocketId}`);
      } catch (err) {
        console.error(`❌ Error handling answer from ${fromSocketId}:`, err);
      } finally {
        peerData.isSettingRemoteAnswerPending = false;
      }
    };

    socket.on("webrtc:answer", handleAnswer);
    return () => {
      socket.off("webrtc:answer", handleAnswer);
    };
  }, [socket]);

  // Handle incoming ICE candidates
  useEffect(() => {
    if (!socket) return;

    const handleIce = async ({
      fromSocketId,
      candidate,
    }: {
      fromSocketId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const peerData = peersRef.current.get(fromSocketId);
      if (!peerData) {
        console.warn(`⚠️ No peer data for ICE candidate from ${fromSocketId}`);
        return;
      }

      if (peerData.ignoreOffer) {
        return;
      }

      if (!peerData.pc.remoteDescription) {
        peerData.pendingCandidates.push(candidate);
        return;
      }

      try {
        await peerData.pc.addIceCandidate(candidate);
        console.log(`🧊 Added ICE candidate from ${fromSocketId}`);
      } catch (err) {
        console.warn(`⚠️ Ignored ICE candidate from ${fromSocketId}:`, err);
      }
    };

    socket.on("webrtc:ice", handleIce);
    return () => {
      socket.off("webrtc:ice", handleIce);
    };
  }, [socket]);

  // Handle new user joining
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = ({ participant }: { participant: Participant }) => {
      if (!participant?.socketId) return;
      console.log("User joined:", participant);
      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === participant.socketId)) {
          return prev;
        }
        return [...prev, participant];
      });
      
      // Determine politeness: existing users are polite to new joiners
      politeRef.current.add(participant.socketId);
      
      // Existing users should wait for the new joiner to initiate
      // But we create the peer connection ready to receive offers
      console.log(`New user ${participant.name} joined. Creating peer connection.`);
      getOrCreatePeer(participant.socketId);
    };

    socket.on("user-joined", handleUserJoined);
    return () => {
      socket.off("user-joined", handleUserJoined);
    };
  }, [socket, getOrCreatePeer]);

  // Handle user leaving
  useEffect(() => {
    if (!socket) return;

    const handleUserLeft = ({ socketId }: { socketId: string }) => {
      console.log("User left:", socketId);
      
      // Close and remove peer connection
      const peerData = peersRef.current.get(socketId);
      if (peerData) {
        peerData.pc.close();
        peersRef.current.delete(socketId);
      }
      
      politeRef.current.delete(socketId);
      initiatorTargetsRef.current.delete(socketId);
      
      // Remove from participants
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    };

    socket.on("user-left", handleUserLeft);
    return () => {
      socket.off("user-left", handleUserLeft);
    };
  }, [socket]);

  // Handle room joined response
  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = ({
      participants: existingParticipants,
      existingParticipants: legacyExistingParticipants,
      you,
    }: {
      participants?: Participant[];
      existingParticipants?: string[];
      you?: Participant;
    }) => {
      const normalizedParticipants = Array.isArray(existingParticipants)
        ? existingParticipants
        : [];

      console.log("Room joined. Existing participants:", normalizedParticipants);
      if (you?.socketId) {
        console.log("My socket ID:", you.socketId);
        setMyInfo(you);
      }

      setParticipants(normalizedParticipants);

      // Legacy compatibility: if only socket IDs are provided, create peer connections only.
      const targetSocketIds = Array.isArray(legacyExistingParticipants)
        ? legacyExistingParticipants
        : normalizedParticipants.map((p) => p.socketId);
      
      // Create peer connections with all existing participants
      // New joiners should initiate connections (they are "impolite")
      targetSocketIds.forEach((targetSocketId) => {
        if (!targetSocketId) return;
        console.log(`🔥 Initiating connection to ${targetSocketId}`);
        getOrCreatePeer(targetSocketId);

        // New joiner sends initial offers to existing participants.
        initiatorTargetsRef.current.add(targetSocketId);
        void createAndSendOffer(targetSocketId);
      });
    };

    socket.on("room-joined", handleRoomJoined);
    return () => {
      socket.off("room-joined", handleRoomJoined);
    };
  }, [socket, getOrCreatePeer, createAndSendOffer]);

  // Handle participant updates (mute/video/screen share state changes)
  useEffect(() => {
    if (!socket) return;

    const handleParticipantUpdated = ({ participant }: { participant: Participant }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === participant.socketId ? { ...p, ...participant } : p))
      );
    };

    socket.on("participant-updated", handleParticipantUpdated);
    return () => {
      socket.off("participant-updated", handleParticipantUpdated);
    };
  }, [socket]);

  // If local media arrives after peers were created, add tracks then renegotiate.
  useEffect(() => {
    if (!localStream) return;

    peersRef.current.forEach(({ pc }, remoteSocketId) => {
      const existingKinds = new Set(
        pc.getSenders()
          .map((sender) => sender.track?.kind)
          .filter(Boolean)
      );

      localStream.getTracks().forEach((track) => {
        if (!existingKinds.has(track.kind)) {
          pc.addTrack(track, localStream);
        }
      });

      if (initiatorTargetsRef.current.has(remoteSocketId)) {
        void createAndSendOffer(remoteSocketId);
      }

    });
  }, [localStream, createAndSendOffer]);

  useEffect(() => {
    if (!socket) return;

    const onToggleAudio = ({ socketId, isMuted }: { socketId: string; isMuted: boolean }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isMuted } : p))
      );
    };

    const onToggleVideo = ({ socketId, isVideoOff }: { socketId: string; isVideoOff: boolean }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isVideoOff } : p))
      );
    };

    const onToggleScreen = ({ socketId, isScreenSharing }: { socketId: string; isScreenSharing: boolean }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isScreenSharing } : p))
      );
    };

    socket.on("user-toggle-audio", onToggleAudio);
    socket.on("user-toggle-video", onToggleVideo);
    socket.on("user-toggle-screen-share", onToggleScreen);

    return () => {
      socket.off("user-toggle-audio", onToggleAudio);
      socket.off("user-toggle-video", onToggleVideo);
      socket.off("user-toggle-screen-share", onToggleScreen);
    };
  }, [socket]);

  // Cleanup all peer connections on unmount
  useEffect(() => {
    const peers = peersRef.current;
    return () => {
      peers.forEach(({ pc }) => pc.close());
      peers.clear();
    };
  }, []);

  return {
    participants,
    myInfo,
    peersRef,
  };
}
