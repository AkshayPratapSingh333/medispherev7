"use client";
import { useState } from "react";

export default function ReviewForm({ doctorId }: { doctorId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, rating, comment }),
    });
    if (res.ok) {
      alert("Review submitted");
    } else {
      alert("Error submitting review");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label>Rating</label>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(+e.target.value)}
        className="border p-2 w-full"
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-1 rounded">Submit</button>
    </form>
  );
}
