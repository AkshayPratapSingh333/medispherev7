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
      className="max-w-md w-full mx-auto bg-gradient-to-br from-white/70 to-stone-50/60 backdrop-blur-lg rounded-2xl shadow-2xl shadow-amber-500/10 p-8 border border-amber-200/50"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-center text-stone-900 mb-6">
        {title}
      </h2>

      {children}

      <div className="my-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-amber-200/40" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-stone-600">or</span>
        </div>
      </div>

      <GoogleButton />
    </motion.div>
  );
}
