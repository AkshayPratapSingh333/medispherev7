"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center justify-center gap-3 w-full py-3 border rounded-lg shadow-md bg-white hover:shadow-lg transition transform hover:scale-105"
    >
      <FcGoogle className="text-2xl" />
      <span className="font-medium text-gray-700">Continue with Google</span>
    </button>
  );
}
