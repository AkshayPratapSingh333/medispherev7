// components/ai/useBrowserSpeech.ts
"use client";

import { useEffect, useRef, useState } from "react";

// Feature detection helpers
export function isSTTAvailable() {
  return typeof window !== "undefined" &&
    ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
}
export function isTTSAvailable() {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

export function useBrowserSTT(opts?: { lang?: string }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = opts?.lang || "en-US";
    rec.onresult = () => {};
    rec.onerror = (e: any) => {
      setError(e?.error || "speech recognition error");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, [opts?.lang]);

  async function start(onText: (finalText: string) => void) {
    if (!recRef.current) return;
    setError(null);
    setListening(true);
    recRef.current.onresult = (e: any) => {
      const t = e?.results?.[0]?.[0]?.transcript ?? "";
      onText(t);
    };
    try {
      recRef.current.start();
    } catch (e) {
      setListening(false);
      setError("Could not start microphone. Check browser permissions.");
    }
  }

  function stop() {
    try {
      recRef.current?.stop();
    } catch {
      /* no-op */
    }
  }

  return { supported, listening, error, start, stop };
}

export function speak(text: string, lang = "en-US") {
  if (!isTTSAvailable()) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  // Optional: slow slightly for clarity
  u.rate = 1.0;
  window.speechSynthesis.speak(u);
}
