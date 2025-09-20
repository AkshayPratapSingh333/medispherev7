// app/page.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";
import CTASection from "../components/home/CTASection";

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden md:ml-64">
      {/* Enhanced Background Layers */}
      <div className="fixed inset-0 -z-10">
        {/* Primary Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50" />
        
        {/* Secondary Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-50/80 via-transparent to-blue-50/60" />
        
        {/* Dynamic Mesh Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-cyan-100/40 to-blue-100/30"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.1))",
              "linear-gradient(225deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))",
              "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.1))",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Large Floating Orbs */}
        {isClient && [...Array(8)].map((_, i) => (
          <motion.div
            key={`large-orb-${i}`}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: `${200 + (i * 50)}px`,
              height: `${200 + (i * 50)}px`,
              left: `${-10 + (i * 15)}%`,
              top: `${-5 + (i * 20)}%`,
              background: i % 3 === 0 
                ? "radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, rgba(6, 182, 212, 0.1) 70%, transparent 100%)"
                : i % 3 === 1
                ? "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(16, 185, 129, 0.1) 70%, transparent 100%)"
                : "radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, rgba(6, 182, 212, 0.1) 70%, transparent 100%)",
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 60, 0],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.1, 0.3, 0.15, 0.1],
            }}
            transition={{
              duration: 25 + (i * 5),
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Medium Floating Elements */}
        {isClient && [...Array(12)].map((_, i) => (
          <motion.div
            key={`medium-orb-${i}`}
            className="absolute rounded-full blur-2xl opacity-15"
            style={{
              width: `${80 + (i * 20)}px`,
              height: `${80 + (i * 20)}px`,
              left: `${5 + (i * 8)}%`,
              top: `${10 + (i * 7)}%`,
              background: "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(20, 184, 166, 0.2) 50%, transparent 100%)",
            }}
            animate={{
              x: [0, -60, 40, 0],
              y: [0, 50, -30, 0],
              scale: [1, 1.3, 0.9, 1],
            }}
            transition={{
              duration: 18 + (i * 2),
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px, 150px 150px, 120px 120px",
            }}
          />
        </div>

        {/* Animated Grid Pattern */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating Particles */}
        {isClient && [...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
            style={{
              left: `${5 + (i * 4.5)}%`,
              top: `${10 + (i * 4)}%`,
            }}
            animate={{
              y: [-20, -60, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Organic Shapes */}
        {isClient && [...Array(6)].map((_, i) => (
          <motion.div
            key={`organic-${i}`}
            className="absolute opacity-10"
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${20 + (i * 10)}%`,
              width: `${120 + (i * 30)}px`,
              height: `${100 + (i * 25)}px`,
              background: `conic-gradient(from ${i * 60}deg, rgba(20, 184, 166, 0.3), rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.3))`,
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              filter: "blur(20px)",
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              borderRadius: [
                "30% 70% 70% 30% / 30% 30% 70% 70%",
                "70% 30% 30% 70% / 70% 70% 30% 30%",
                "30% 70% 70% 30% / 30% 30% 70% 70%",
              ],
            }}
            transition={{
              duration: 20 + (i * 5),
              repeat: Infinity,
              delay: i * 3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Light Rays Effect */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "conic-gradient(from 0deg at 30% 40%, transparent 60%, rgba(20, 184, 166, 0.1) 70%, transparent 80%)",
              "conic-gradient(from 120deg at 70% 60%, transparent 60%, rgba(6, 182, 212, 0.1) 70%, transparent 80%)",
              "conic-gradient(from 240deg at 50% 80%, transparent 60%, rgba(59, 130, 246, 0.1) 70%, transparent 80%)",
              "conic-gradient(from 360deg at 30% 40%, transparent 60%, rgba(20, 184, 166, 0.1) 70%, transparent 80%)",
            ],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content Sections with Enhanced Spacing */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <HeroSection />
        </motion.div>

        {/* Section Divider */}
        <motion.div
          className="h-20 bg-gradient-to-b from-transparent via-white/30 to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <FeaturesSection />
        </motion.div>

        {/* Section Divider */}
        <motion.div
          className="h-16 bg-gradient-to-b from-transparent via-cyan-50/40 to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <HowItWorks />
        </motion.div>

        {/* Section Divider */}
        <motion.div
          className="h-16 bg-gradient-to-b from-transparent via-emerald-50/40 to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Testimonials />
        </motion.div>

        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <CTASection />
        </motion.div>
      </div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 origin-left z-50"
        style={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false, amount: 0 }}
      />
    </div>
  );
}