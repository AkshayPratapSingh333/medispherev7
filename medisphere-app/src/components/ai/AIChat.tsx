"use client";
import { useState } from "react";

export default function AIChat({ patientId }: { patientId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");

  async function send() {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, message: input }),
    });
    const j = await res.json();
    if (res.ok) {
      setMessages((m) => [...m, { role: "user", content: input }, { role: "ai", content: j.reply }]);
    }
    setInput("");
  }

  return (
    <div className="border p-3 rounded space-y-3">
      <div className="h-40 overflow-y-auto border p-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "ai" ? "text-left" : "text-right"}>
            <span className="inline-block bg-gray-200 px-2 py-1 rounded">{m.content}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={send} className="bg-blue-600 text-white px-3 ml-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
