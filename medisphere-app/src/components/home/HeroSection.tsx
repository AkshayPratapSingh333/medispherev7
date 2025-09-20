"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <section className="relative text-center py-24 bg-gradient-to-br from-emerald-50 via-cyan-100 to-teal-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-blue-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating Particles */}
        {isClient && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full opacity-60"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i * 10)}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + (i * 0.3),
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.02 }}
        >
          Welcome to{" "}
          <motion.span 
            className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent relative inline-block"
            whileHover={{ 
              scale: 1.05,
              textShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
            }}
          >
            Panchkarma
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-teal-400/20 blur-xl -z-10"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          whileHover={{ scale: 1.02 }}
        >
          A modern telemedicine platform for Ayurvedic wellness and Panchkarma
          therapies — connect with doctors, book sessions, and track your health
          journey.
        </motion.p>

        <motion.div
          className="mt-8 flex justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <Link
              href="/auth/signup"
              className="relative px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl shadow-lg overflow-hidden font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-teal-200"
            >
              <span className="relative z-10">Get Started</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100"
                initial={false}
                animate={{
                  background: [
                    "linear-gradient(45deg, #14b8a6, #10b981)",
                    "linear-gradient(225deg, #06b6d4, #14b8a6)",
                    "linear-gradient(45deg, #14b8a6, #10b981)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{
                  x: [-100, 100],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <Link
              href="/doctors"
              className="relative px-8 py-4 bg-white/80 backdrop-blur-sm text-teal-700 border-2 border-teal-200 rounded-xl shadow-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-100 hover:border-teal-300 hover:bg-white/90 overflow-hidden"
            >
              <span className="relative z-10">Find Doctors</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-cyan-100 to-teal-100 group-hover:w-full"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -top-1 -left-1 w-0 h-0 border-t-2 border-l-2 border-teal-300 group-hover:w-4 group-hover:h-4"
                transition={{ duration: 0.3, delay: 0.1 }}
              />
              <motion.div
                className="absolute -bottom-1 -right-1 w-0 h-0 border-b-2 border-r-2 border-teal-300 group-hover:w-4 group-hover:h-4"
                transition={{ duration: 0.3, delay: 0.1 }}
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </section>
  );
}