"use client";
import { useEffect, useRef } from "react";
import VideoControls from "../video/VideoControls";

export default function VideoCall() {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localRef.current) localRef.current.srcObject = stream;
      // TODO: setup WebRTC peer connection and attach remote stream
    }
    init();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <video ref={localRef} autoPlay playsInline muted className="w-48 border rounded mb-2" />
      <video ref={remoteRef} autoPlay playsInline className="w-96 border rounded" />
      <VideoControls />
    </div>
  );
}
