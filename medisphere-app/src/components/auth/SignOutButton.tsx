// components/auth/SignOutButton.tsx
"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        try {
          setLoading(true);
          await signOut({ redirect: false }); // clear cookies
          router.push("/");                   // navigate
          router.refresh();                   // re-evaluate session on client
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-lg"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
