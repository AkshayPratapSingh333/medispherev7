"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn("credentials", { email, password, callbackUrl: "/patient/dashboard" });
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded shadow w-80 space-y-4"
      >
        <h1 className="text-lg font-semibold">Sign In</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/patient/dashboard" })}
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          Sign In with Google
        </button>
      </form>
    </div>
  );
}
