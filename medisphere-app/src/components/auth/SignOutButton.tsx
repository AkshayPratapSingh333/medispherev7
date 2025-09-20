"use client";

import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

export default function SignOutButton() {
  return (
    <motion.button
      onClick={() => signOut({ callbackUrl: "/", redirect: true })} // 👈 force redirect
      className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:from-red-600 hover:to-rose-600 transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Sign out
    </motion.button>
  );
}
