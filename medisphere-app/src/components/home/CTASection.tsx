"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-white text-center overflow-hidden">
      {/* Static layered gradients for depth without runtime loops */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-white/10 to-cyan-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-white/10 to-teal-300/20 rounded-full blur-3xl" />
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-20">
          <path
            d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-lg"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35 }}
          whileHover={{ 
            scale: 1.02
          }}
        >
          Ready to Start Your{" "}
          <motion.span 
            className="relative inline-block"
            whileHover={{ scale: 1.03 }}
          >
            MediSphere Journey?
            <span className="absolute inset-0 bg-white/20 blur-xl -z-10 rounded-lg" />
          </motion.span>
        </motion.h2>

        <motion.p
          className="mb-10 text-lg md:text-xl text-cyan-50 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          Join thousands of patients improving their health with Ayurveda and 
          experience the transformative power of ancient wisdom.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="relative"
        >
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block relative group"
          >
            <Link
              href="/auth/signup"
              className="relative px-10 py-4 bg-white text-teal-700 font-bold text-lg rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-white/20 inline-block"
            >
              <span className="relative z-10">Get Started Now</span>

              <span className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute inset-0 border-2 border-white/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </motion.div>

          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-white/10 to-cyan-200/10 blur-xl -z-10" />
        </motion.div>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
    </section>
  );
}