"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin",
    });

    if (res?.error) {
      setErr(res.error);
      setLoading(false);
      return;
    }

    // Optional: verify role via API and redirect if not admin
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-800 text-center">Admin Login</h1>
        {err && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm my-4">{err}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Checking..." : "Sign In as Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}
