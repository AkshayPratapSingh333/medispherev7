export default function ChatHistory({ messages }: { messages: any[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {messages.map((m, i) => (
        <div key={i} className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
          <span className="inline-block px-3 py-1 rounded bg-gray-200">{m.content}</span>
        </div>
      ))}
    </div>
  );
}
