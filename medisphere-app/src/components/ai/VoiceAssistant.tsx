// components/ai/VoiceAssistant.tsx
"use client";

import { useRef, useState } from "react";

export default function VoiceAssistant() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function toggleRecord() {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const base64 = await blobToBase64(blob);
      const stt = await fetch("/api/ai/stt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64, mimeType: "audio/webm" }),
      });
      const j = await stt.json().catch(() => ({}));
      const text = j.text || "";
      setTranscript(text);

      if (text) {
        // You could call /api/ai/chat here as well to get a spoken reply
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const t = await res.json().catch(() => ({}));
        const audioB64 = t.audioContent || "";
        setReply(text);
        if (audioB64) {
          const audio = new Audio("data:audio/mp3;base64," + audioB64);
          audio.play().catch(() => {});
        }
      }
    };
    mr.start();
    mediaRef.current = mr;
    setRecording(true);
  }

  return (
    <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="text-lg font-semibold text-cyan-900">Voice Assistant</div>
      <p className="text-sm text-cyan-800/70">
        Record your question. We’ll transcribe it and read it back (demo).
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={toggleRecord}
          className={`rounded-xl px-4 py-2 text-white font-medium shadow ${
            recording ? "bg-rose-500" : "bg-gradient-to-r from-cyan-500 to-emerald-500"
          }`}
        >
          {recording ? "Stop Recording" : "Record Voice"}
        </button>
      </div>

      {transcript && (
        <div className="mt-3 rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 p-3 ring-1 ring-cyan-100 text-cyan-900">
          <div className="text-sm text-cyan-700/70">Transcription</div>
          <div className="font-medium">{transcript}</div>
        </div>
      )}

      {reply && (
        <div className="mt-2 text-xs text-cyan-800/70">
          (The same text was synthesized via TTS for demo.)
        </div>
      )}
    </div>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || "");
      resolve(res.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
