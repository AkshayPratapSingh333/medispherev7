// components/ai/AIChat.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "user" | "assistant"; content: string };
type UploadedDoc = { name: string; content: string };
type UploadedImage = { name: string; base64: string; mimeType: string };

export default function AIChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your AI assistant.\n\n**I can help you with:**\n- General questions\n- Document analysis (upload PDFs, DOCX, TXT)\n- Image analysis (medical images, X-rays, scans)\n\nJust ask me anything or upload a file!",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBusy(true);
    for (const file of files) {
      try {
        if (file.type.startsWith("image/")) {
          const base64 = await fileToBase64(file);
          setUploadedImages((prev) => [...prev, { name: file.name, base64, mimeType: file.type }]);
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content: `📷 **Image uploaded:** ${file.name}\n\nAsk me to analyze it when ready.`,
            },
          ]);
        } else {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/ai/process-document", {
            method: "POST",
            body: formData,
          });
          const result = await res.json();

          if (!res.ok) {
            setMessages((m) => [
              ...m,
              {
                role: "assistant",
                content: `⚠️ **${file.name}**: ${result?.error || "Failed to process."}`,
              },
            ]);
          } else {
            setUploadedDocs((prev) => [...prev, { name: file.name, content: result.text }]);
            setMessages((m) => [
              ...m,
              {
                role: "assistant",
                content: `📄 **Document uploaded:** ${file.name}\n\nExtracted **${result.length}** characters${result.truncated ? " (truncated)" : ""}. You can now ask me questions about it.`,
              },
            ]);
          }
        }
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `⚠️ Error processing **${file.name}**. Please try again.` },
        ]);
      }
    }

    setBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function clearContext() {
    setUploadedDocs([]);
    setUploadedImages([]);
    setMessages([
      {
        role: "assistant",
        content: "🔄 Context cleared. All uploaded documents and images have been removed.",
      },
    ]);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    // Prepare and optimistically render the latest user message
    const outgoing = [...messages, { role: "user" as const, content: text }];
    setMessages(outgoing);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoing, // send the array INCLUDING the latest user msg
          language: "en",
          documents: uploadedDocs,
          images: uploadedImages,
        }),
      });

      const j = await res.json();
      const reply = j.response || "⚠️ No reply";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Network error" }]);
    } finally {
      setBusy(false);
    }
  }

  const hasContext = uploadedDocs.length > 0 || uploadedImages.length > 0;

  return (
    <div className="rounded-2xl border border-cyan-100 bg-white shadow-sm">
      {hasContext && (
        <div className="border-b border-cyan-100 p-3 bg-gradient-to-r from-cyan-50 to-emerald-50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-cyan-800">
              <span className="font-medium">Context:</span>{" "}
              {uploadedDocs.length > 0 && (
                <span className="mr-2 inline-flex items-center rounded-full bg-cyan-600/10 px-2 py-0.5 text-xs text-cyan-900 ring-1 ring-cyan-200">
                  {uploadedDocs.length} doc
                  {uploadedDocs.length > 1 ? "s" : ""}
                </span>
              )}
              {uploadedImages.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs text-emerald-900 ring-1 ring-emerald-200">
                  {uploadedImages.length} image
                  {uploadedImages.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={clearContext}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="h-[460px] overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const mine = m.role === "user";
          return (
            <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  mine
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                    : "bg-gradient-to-r from-cyan-50 to-emerald-50 text-cyan-900 ring-1 ring-cyan-100"
                }`}
              >
                <div className={mine ? "prose prose-sm prose-invert max-w-none" : "prose prose-sm max-w-none"}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2 bg-cyan-100 text-cyan-700 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
                    ●
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
                    ●
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
                    ●
                  </span>
                </div>
                Thinking…
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-cyan-100 p-3">
        <div className="flex gap-2 mb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.txt,.docx"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer rounded-xl border border-cyan-200 bg-white/90 px-3 py-2 text-sm text-cyan-700 hover:bg-cyan-50 transition-colors"
          >
            📎 Attach File
          </label>
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-cyan-200/70 bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 text-sm"
            placeholder="Ask your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-white font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  return dataUrl.split(",")[1] || "";
}
