"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const steps = [
  { 
    step: "1", 
    title: "Sign Up", 
    desc: "Create your free account and join the wellness community.",
    icon: "👤",
    color: "from-blue-400 to-cyan-500"
  },
  { 
    step: "2", 
    title: "Find a Doctor", 
    desc: "Browse certified practitioners and apply smart filters.",
    icon: "🔍",
    color: "from-teal-400 to-emerald-500"
  },
  { 
    step: "3", 
    title: "Book Appointment", 
    desc: "Schedule your session easily with flexible timing.",
    icon: "📅",
    color: "from-emerald-400 to-green-500"
  },
  { 
    step: "4", 
    title: "Video Call", 
    desc: "Connect live with your doctor for personalized care.",
    icon: "📹",
    color: "from-cyan-400 to-blue-500"
  },
];

export default function HowItWorks() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Background Orbs */}
        {isClient && [...Array(6)].map((_, i) => (
          <motion.div
            key={`bg-orb-${i}`}
            className="absolute w-40 h-40 bg-gradient-to-br from-teal-200/20 to-blue-200/20 rounded-full blur-3xl"
            style={{
              left: `${5 + (i * 15)}%`,
              top: `${10 + (i * 12)}%`,
            }}
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10 + (i * 1.5),
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Connecting Path Pattern */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <motion.path
            d="M100,200 Q400,100 700,200 Q1000,300 1300,200"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="10,5"
            opacity="0.3"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Enhanced Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            How It Works{" "}
            <motion.span
              className="relative inline-block"
              whileHover={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.6 }}
            >
              Works
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-blue-200/30 blur-xl -z-10 rounded-lg"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [0.8, 1.4, 0.8],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-lg text-slate-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Your journey to wellness in four simple steps
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Lines for Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1">
            {isClient && [...Array(3)].map((_, i) => (
              <motion.div
                key={`line-${i}`}
                className="absolute w-1/4 h-1 bg-gradient-to-r from-teal-300 to-blue-300 rounded-full"
                style={{ left: `${25 + (i * 25)}%`, transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: (i + 1) * 0.5, duration: 0.8 }}
              />
            ))}
          </div>

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              className="group relative"
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.2, duration: 0.7 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              {/* Main Card */}
              <div className="relative p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 text-center overflow-hidden h-full transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-100/50">
                
                {/* Background Gradient Overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5`}
                  transition={{ duration: 0.5 }}
                />

                {/* Step Number Circle */}
                <motion.div
                  className="relative mb-6 mx-auto"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${s.color} rounded-full flex items-center justify-center shadow-lg mx-auto relative overflow-hidden`}>
                    <span className="text-2xl font-bold text-white relative z-10">
                      {s.step}
                    </span>
                    
                    {/* Rotating Ring */}
                    <motion.div
                      className="absolute inset-0 border-4 border-white/30 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        borderTopColor: "transparent",
                        borderRightColor: "transparent",
                      }}
                    />
                    
                    {/* Pulse Ring */}
                    <motion.div
                      className="absolute inset-0 border-2 border-white/50 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                  </div>

                  {/* Icon Overlay */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-lg"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    {s.icon}
                  </motion.div>
                </motion.div>

                {/* Content */}
                <motion.h3
                  className="text-xl font-bold text-slate-700 mb-3 group-hover:text-teal-700 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {s.title}
                </motion.h3>
                
                <motion.p
                  className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300"
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  {s.desc}
                </motion.p>

                {/* Progress Bar */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ delay: i * 0.3, duration: 0.8 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${s.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ delay: i * 0.3 + 0.2, duration: 0.6 }}
                  />
                </motion.div>

                {/* Floating Elements */}
                {isClient && [...Array(4)].map((_, idx) => (
                  <motion.div
                    key={`float-${i}-${idx}`}
                    className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-0 group-hover:opacity-60"
                    style={{
                      left: `${20 + (idx * 20)}%`,
                      top: `${30 + (idx * 15)}%`,
                    }}
                    animate={{
                      y: [-8, -20, -8],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: idx * 0.4,
                    }}
                  />
                ))}

                {/* Corner Glow */}
                <motion.div
                  className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/50 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* External Card Glow */}
              <motion.div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${s.color} blur-xl -z-10 opacity-0 group-hover:opacity-20`}
                transition={{ duration: 0.5 }}
              />

              {/* Step Indicator Arrow */}
              {i < steps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute top-12 -right-4 z-20"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 1) * 0.3, duration: 0.6 }}
                >
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="url(#stepGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="stepGradient">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-semibold">Ready to get started?</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              →
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}