"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-cyan-100 to-teal-100 overflow-hidden">
      {/* Static background accents keep depth without runtime animation cost */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-tr from-teal-200/30 to-blue-200/30 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-center bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent"
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
          className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto text-center leading-relaxed px-4 mb-8 sm:mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          A modern telemedicine platform for Ayurvedic wellness and MediSphere
          therapies — connect with doctors, book sessions, and track your health
          journey.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group w-full sm:w-auto"
          >
            <Link
              href="/auth/signup"
              className="relative block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-teal-200 text-center"
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group w-full sm:w-auto"
          >
            <Link
              href="/doctors"
              className="relative block px-6 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-sm text-teal-700 border-2 border-teal-200 rounded-xl sm:rounded-2xl shadow-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-100 hover:border-teal-300 hover:bg-white/90 overflow-hidden text-center"
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
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </section>
  );
}