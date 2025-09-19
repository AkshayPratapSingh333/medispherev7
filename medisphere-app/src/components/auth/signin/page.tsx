// app/auth/signin/page.tsx
"use client";
import LoginForm from "../../../components/forms/LoginForm";
import { signIn } from "next-auth/react";

export default function SigninPage() {
  async function onLogin(email: string, password: string) {
    // use NextAuth credentials provider
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      alert(res.error);
      return;
    }
    // on success NextAuth sets cookie; redirect handled by client:
    window.location.href = "/";
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <LoginForm onLogin={onLogin} />
      <div className="mt-4">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full border px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
