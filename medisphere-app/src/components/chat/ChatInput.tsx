"use client";

import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (content: string) => void | Promise<void> }) {
  const [val, setVal] = useState("");
  return (
    <div className="border-t border-cyan-100 p-3 bg-white">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-cyan-200/70 bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 text-sm"
          placeholder="Type a message…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && val.trim()) {
              await onSend(val.trim());
              setVal("");
            }
          }}
        />
        <button
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-white"
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
