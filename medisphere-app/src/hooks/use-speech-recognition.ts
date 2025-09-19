// hooks/use-speech-recognition.ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useSpeechRecognition() {
  const [supported, setSupported] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.onresult = (ev: any) => {
      const txt = Array.from(ev.results).map((r: any) => r[0].transcript).join("");
      setTranscript(txt);
    };
    rec.onerror = (e: any) => {
      console.warn("Speech recognition error", e);
    };
    recognitionRef.current = rec;
  }, []);

  function start() {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      // ignore repeated starts
    }
  }

  function stop() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  }

  return { supported, listening, transcript, start, stop, setTranscript };
}
