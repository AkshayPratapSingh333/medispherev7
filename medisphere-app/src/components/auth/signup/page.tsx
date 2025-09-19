// app/auth/signup/page.tsx
"use client";
import RegisterForm from "../../../components/forms/RegisterForm";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  async function onRegister(data: { name?: string; email: string; password: string }) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await res.json();
    if (res.ok && j.user) {
      // success — redirect to sign in
      router.push("/auth/signin");
    } else {
      alert(j.error || "Signup failed");
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <RegisterForm onRegister={onRegister} />
    </div>
  );
}
