"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative text-center py-24 bg-gradient-to-br from-emerald-50 via-cyan-100 to-teal-100 overflow-hidden">
      {/* Static background accents keep depth without runtime animation cost */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-blue-200/30 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          Welcome to{" "}
          <motion.span 
            className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent relative inline-block"
            whileHover={{ scale: 1.02 }}
          >
            MediSphere
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-teal-400/20 blur-xl -z-10" />
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          A modern telemedicine platform for Ayurvedic wellness and MediSphere
          therapies — connect with doctors, book sessions, and track your health
          journey.
        </motion.p>

        <motion.div
          className="mt-8 flex justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
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
              <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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