// hooks/use-webrtc.ts
"use client";
import { useRef, useEffect } from "react";

export function useWebRTC(config?: RTCConfiguration) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    pcRef.current = new RTCPeerConnection(config ?? {});
    remoteStreamRef.current = new MediaStream();

    pcRef.current.ontrack = (ev) => {
      ev.streams[0].getTracks().forEach((t) => remoteStreamRef.current!.addTrack(t));
    };

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      remoteStreamRef.current = null;
    };
  }, [config]);

  async function startLocalMedia(constraints: MediaStreamConstraints = { audio: true, video: true }) {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
    // add tracks to peer connection
    localStreamRef.current.getTracks().forEach((t) => pcRef.current?.addTrack(t, localStreamRef.current!));
    return localStreamRef.current;
  }

  async function createOffer() {
    const pc = pcRef.current!;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async function setRemoteAnswer(answer: RTCSessionDescriptionInit) {
    const pc = pcRef.current!;
    await pc.setRemoteDescription(answer);
  }

  async function createAnswer(offer: RTCSessionDescriptionInit) {
    const pc = pcRef.current!;
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  return {
    pcRef,
    localStreamRef,
    remoteStreamRef,
    startLocalMedia,
    createOffer,
    createAnswer,
    setRemoteAnswer,
  };
}
