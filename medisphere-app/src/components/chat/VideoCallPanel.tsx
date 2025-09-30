"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "../../lib/socket";

const ICE = [{ urls: "stun:stun.l.google.com:19302" }];

export default function VideoCallPanel({
  appointmentId,
  onClose,
  myId, // pass a stable string (e.g., session.user.id or socket.id)
}: {
  appointmentId: string;
  onClose: () => void;
  myId: string;
}) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioTrRef = useRef<RTCRtpTransceiver | null>(null);
  const videoTrRef = useRef<RTCRtpTransceiver | null>(null);
  const makingOfferRef = useRef(false);
  const isSettingRemoteAnswerPendingRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const [active, setActive] = useState(false);

  const polite = useRef<boolean>(true); // default; set once we know remote id (optional)

  useEffect(() => {
    (async () => {
      const socket = await getSocket();

      // Optional: set politeness using a stable tie-breaker if you have remoteId.
      // For 1:1 room without peer ids, use myId to break ties lexicographically.
      polite.current = true; // or: polite.current = myId < "peerIdStringFromRemote";

      socket.on("webrtc:offer", async ({ sdp }) => {
        const pc = await ensurePeer();

        const offer = new RTCSessionDescription(sdp);

        const readyForOffer =
          !makingOfferRef.current &&
          (pc.signalingState === "stable" || isSettingRemoteAnswerPendingRef.current);

        const offerCollision = !readyForOffer;
        ignoreOfferRef.current = !polite.current && offerCollision;
        if (ignoreOfferRef.current) return;

        isSettingRemoteAnswerPendingRef.current = offerCollision;
        await pc.setRemoteDescription(offer);
        isSettingRemoteAnswerPendingRef.current = false;

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { appointmentId, sdp: pc.localDescription });
        setActive(true);
      });

      socket.on("webrtc:answer", async ({ sdp }) => {
        const pc = await ensurePeer();
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        setActive(true);
      });

      socket.on("webrtc:ice", async ({ candidate }) => {
        const pc = await ensurePeer();
        if (candidate) {
          try {
            await pc.addIceCandidate(candidate);
          } catch {
            // ignore if setting remote desc not ready
          }
        }
      });

      return () => {
        socket.off("webrtc:offer");
        socket.off("webrtc:answer");
        socket.off("webrtc:ice");
      };
    })();

    return () => {
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, myId]);

  async function ensurePeer() {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({ iceServers: ICE });
    pcRef.current = pc;

    // === FIX 1: stable m-line order via transceivers ===
    const audioTr = pc.addTransceiver("audio", { direction: "sendrecv" });
    const videoTr = pc.addTransceiver("video", { direction: "sendrecv" });
    audioTrRef.current = audioTr;
    videoTrRef.current = videoTr;

    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        const socket = await getSocket();
        socket.emit("webrtc:ice", { appointmentId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      if (remoteRef.current && e.streams[0]) {
        remoteRef.current.srcObject = e.streams[0];
      }
    };

    // Bind local media using replaceTrack (don’t add/remove senders later)
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localRef.current) localRef.current.srcObject = stream;
    await audioTr.sender.replaceTrack(stream.getAudioTracks()[0] || null);
    await videoTr.sender.replaceTrack(stream.getVideoTracks()[0] || null);

    // Optional: negotiationneeded handler (guard with makingOffer)
    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        const socket = await getSocket();
        socket.emit("webrtc:offer", { appointmentId, sdp: pc.localDescription });
      } catch {
        // swallow
      } finally {
        makingOfferRef.current = false;
      }
    };

    return pc;
  }

  async function startCall() {
    const pc = await ensurePeer();
    const socket = await getSocket();
    try {
      makingOfferRef.current = true;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { appointmentId, sdp: pc.localDescription });
      socket.emit("call:start", { appointmentId });
      setActive(true);
    } finally {
      makingOfferRef.current = false;
    }
  }

  async function endCall() {
    const socket = await getSocket();
    socket.emit("call:end", { appointmentId });

    const pc = pcRef.current;
    pcRef.current = null;

    try {
      if (pc) {
        pc.onnegotiationneeded = null;
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.getSenders().forEach((s) => s.track?.stop());
        pc.getReceivers().forEach((r) => r.track?.stop());
        pc.close();
      }
      const local = localRef.current?.srcObject as MediaStream | null;
      local?.getTracks().forEach((t) => t.stop());
      if (localRef.current) localRef.current.srcObject = null;
      const remote = remoteRef.current?.srcObject as MediaStream | null;
      remote?.getTracks().forEach((t) => t.stop());
      if (remoteRef.current) remoteRef.current.srcObject = null;
    } finally {
      setActive(false);
      onClose?.();
    }
  }

  return (
    <div className="rounded-xl border border-cyan-100 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold text-cyan-900">{active ? "Call in progress" : "Video Call"}</div>
        <div className="space-x-2">
          {!active ? (
            <button
              onClick={startCall}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-1.5 text-white"
            >
              Start
            </button>
          ) : (
            <button onClick={endCall} className="rounded-lg bg-rose-500 px-3 py-1.5 text-white">
              End
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <video ref={localRef} autoPlay playsInline muted className="w-full rounded-lg bg-cyan-50" />
        <video ref={remoteRef} autoPlay playsInline className="w-full rounded-lg bg-emerald-50" />
      </div>
    </div>
  );
}
