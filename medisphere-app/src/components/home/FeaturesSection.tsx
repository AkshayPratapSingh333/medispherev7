"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const features = [
  {
    title: "Smart Appointments",
    desc: "Book, reschedule, and manage Panchkarma sessions easily.",
    icon: "📅",
    gradient: "from-teal-400 to-cyan-500",
  },
  {
    title: "Video Consultations",
    desc: "High-quality video and chat with doctors anytime.",
    icon: "📹",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    title: "Medical Reports",
    desc: "Upload and access encrypted health reports securely.",
    icon: "📋",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    title: "AI Health Assistant",
    desc: "Analyze reports and get safe medical insights (Gemini AI).",
    icon: "🤖",
    gradient: "from-cyan-400 to-blue-500",
  },
];

export default function FeaturesSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative py-20 max-w-7xl mx-auto px-6 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        {isClient && [...Array(5)].map((_, i) => (
          <motion.div
            key={`bg-orb-${i}`}
            className="absolute w-32 h-32 bg-gradient-to-br from-teal-100/30 to-cyan-100/30 rounded-full blur-2xl"
            style={{
              left: `${10 + (i * 20)}%`,
              top: `${20 + (i * 15)}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8 + (i * 1.5),
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full">
            {isClient && [...Array(60)].map((_, i) => (
              <motion.div
                key={`grid-${i}`}
                className="w-2 h-2 bg-teal-400 rounded-full"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  delay: (i * 0.1) % 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            Why Choose Us{" "}
            <motion.span 
              className="relative inline-block"
              whileHover={{ rotate: [0, -2, 2, 0] }}
              transition={{ duration: 0.5 }}
            >
              Panchkarma?
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-200/20 to-cyan-200/20 blur-xl -z-10 rounded-lg"
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.span>
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group relative"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Card Container */}
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-teal-100/50">
                
                {/* Background Gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5`}
                  transition={{ duration: 0.5 }}
                />

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(45deg, transparent, rgba(20, 184, 166, 0.1), transparent)`,
                  }}
                  animate={{
                    background: [
                      `linear-gradient(0deg, transparent, rgba(20, 184, 166, 0.1), transparent)`,
                      `linear-gradient(180deg, transparent, rgba(6, 182, 212, 0.1), transparent)`,
                      `linear-gradient(360deg, transparent, rgba(20, 184, 166, 0.1), transparent)`,
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Icon Container */}
                <motion.div
                  className="relative mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                    <motion.span
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    >
                      {f.icon}
                    </motion.span>
                  </div>
                  
                  {/* Icon Glow */}
                  <motion.div
                    className={`absolute inset-0 w-16 h-16 bg-gradient-to-br ${f.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30`}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>

                {/* Content */}
                <motion.h3
                  className="text-xl font-bold text-slate-700 mb-3 group-hover:text-teal-700 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {f.title}
                </motion.h3>
                
                <motion.p
                  className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300"
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  {f.desc}
                </motion.p>

                {/* Hover Effect Lines */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 w-0 group-hover:w-full transition-all duration-500"
                />
                
                {/* Corner Decorations */}
                <motion.div
                  className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-teal-200/50 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
                <motion.div
                  className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-200/50 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3, delay: 0.1 }}
                />

                {/* Floating Particles */}
                {isClient && [...Array(3)].map((_, idx) => (
                  <motion.div
                    key={`particle-${i}-${idx}`}
                    className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-0 group-hover:opacity-60"
                    style={{
                      left: `${30 + (idx * 20)}%`,
                      top: `${40 + (idx * 15)}%`,
                    }}
                    animate={{
                      y: [-5, -15, -5],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: idx * 0.3,
                    }}
                  />
                ))}
              </div>

              {/* External Glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-200/20 to-cyan-200/20 blur-xl -z-10 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom Decorative Element */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`dot-${i}`}
                className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}