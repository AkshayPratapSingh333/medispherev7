import { useEffect, useRef, useState } from "react";

export function useWebRTCClient(socket: any, roomId: string) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!socket) return;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;

    const remote = new MediaStream();
    setRemoteStream(remote);
    pc.ontrack = (ev) => ev.streams[0].getTracks().forEach(t => remote.addTrack(t));

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("signal", { roomId, type: "candidate", candidate: e.candidate });
    };

    socket.on("signal", async (payload: any) => {
      try {
        if (payload.type === "offer") {
          await pc.setRemoteDescription(payload.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("signal", { roomId, type: "answer", sdp: pc.localDescription });
        } else if (payload.type === "answer") {
          await pc.setRemoteDescription(payload.sdp);
        } else if (payload.type === "candidate") {
          await pc.addIceCandidate(payload.candidate);
        }
      } catch (err) {
        console.error("webrtc signal error", err);
      }
    });

    return () => {
      socket.off("signal");
      pc.close();
      pcRef.current = null;
    };
  }, [socket, roomId]);

  async function startLocal() {
    const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(media);
    media.getTracks().forEach(t => pcRef.current?.addTrack(t, media));
  }

  async function createOffer() {
    const pc = pcRef.current;
    if (!pc) throw new Error("pc not ready");
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("signal", { roomId, type: "offer", sdp: pc.localDescription });
  }

  return { startLocal, createOffer, localStream, remoteStream };
}
