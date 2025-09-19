"use client";
import { useState } from "react";

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);

  function toggle() {
    setRecording(!recording);
    // TODO: integrate Web Audio API + STT API
  }

  return (
    <button onClick={toggle} className="px-3 py-1 bg-gray-200 rounded">
      {recording ? "Stop Recording" : "Record Voice"}
    </button>
  );
}
    