"use client";

import { motion } from "framer-motion";
import GoogleButton from "./GoogleButton";

export default function AuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="max-w-md w-full mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 border border-white/10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-center text-white mb-6">
        {title}
      </h2>

      {children}

      <div className="my-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-900 px-2 text-gray-400">or</span>
        </div>
      </div>

      <GoogleButton />
    </motion.div>
  );
}
