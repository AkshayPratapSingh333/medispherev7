"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CTASection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative py-20 bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-white text-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-white/10 to-cyan-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-white/10 to-teal-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating Elements */}
        {isClient && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white/30 rounded-full"
            style={{
              left: `${15 + (i * 10)}%`,
              top: `${20 + (i * 8)}%`,
            }}
            animate={{
              y: [-15, -35, -15],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + (i * 0.4),
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Geometric Shapes */}
        {isClient && [...Array(4)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute w-6 h-6 border-2 border-white/20 rotate-45"
            style={{
              left: `${25 + (i * 20)}%`,
              top: `${40 + (i * 5)}%`,
            }}
            animate={{
              rotate: [45, 225, 45],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* Wave Effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-20">
          <motion.path
            d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z"
            fill="rgba(255,255,255,0.1)"
            animate={{
              d: [
                "M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z",
                "M0,40 C300,80 600,40 900,80 C1050,60 1150,60 1200,40 L1200,120 L0,120 Z",
                "M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          whileHover={{ 
            scale: 1.05,
            textShadow: "0 0 30px rgba(255,255,255,0.5)"
          }}
        >
          Ready to Start Your{" "}
          <motion.span 
            className="relative inline-block"
            whileHover={{ scale: 1.1 }}
          >
            Panchkarma Journey?
            <motion.div
              className="absolute inset-0 bg-white/20 blur-xl -z-10 rounded-lg"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.span>
        </motion.h2>

        <motion.p
          className="mb-10 text-lg md:text-xl text-cyan-50 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          whileHover={{ scale: 1.02 }}
        >
          Join thousands of patients improving their health with Ayurveda and 
          experience the transformative power of ancient wisdom.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative"
        >
          <motion.div
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block relative group"
          >
            <Link
              href="/auth/signup"
              className="relative px-10 py-4 bg-white text-teal-700 font-bold text-lg rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-white/20 inline-block"
            >
              <span className="relative z-10">Get Started Now</span>
              
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                animate={{
                  x: [-200, 200],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
              
              {/* Pulse Ring */}
              <motion.div
                className="absolute inset-0 border-2 border-white/50 rounded-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/20 blur-md -z-10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </Link>
          </motion.div>
          
          {/* Additional CTA Effects */}
          <motion.div
            className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-white/10 to-cyan-200/10 blur-xl -z-10"
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
    </section>
  );
}