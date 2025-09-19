"use client";
import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  }

  return (
    <form onSubmit={submit} className="flex border-t">
      <input
        className="flex-1 p-2 outline-none"
        placeholder="Type a message…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4">Send</button>
    </form>
  );
}
