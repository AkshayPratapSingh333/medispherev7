"use client";

import { useRef, useState } from "react";

export default function ChatInput({
  onSend,
  onSendAttachment,
}: {
  onSend: (content: string) => void | Promise<void>;
  onSendAttachment: (file: File) => void | Promise<void>;
}) {
  const [val, setVal] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    for (const file of files) {
      try {
        await onSendAttachment(file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to upload file";
        alert(msg);
      }
    }
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="border-t border-emerald-200 p-3 bg-white">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          id="chat-attachment-input"
          type="file"
          className="hidden"
          multiple
          accept="image/*,.pdf,.txt,.doc,.docx"
          onChange={handleFileChange}
        />
        <label
          htmlFor="chat-attachment-input"
          className="inline-flex items-center rounded-xl border border-emerald-200/70 bg-white/90 px-3 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 cursor-pointer"
        >
          {uploading ? "Uploading..." : "Attach"}
        </label>

        <input
          className="flex-1 rounded-xl border border-emerald-200/70 bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300/70 text-sm"
          placeholder="Type a message…"
          value={val}
          disabled={uploading}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && val.trim()) {
              await onSend(val.trim());
              setVal("");
            }
          }}
        />
        <button
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-white"
          disabled={uploading}
          onClick={async () => {
            if (val.trim()) {
              await onSend(val.trim());
              setVal("");
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
