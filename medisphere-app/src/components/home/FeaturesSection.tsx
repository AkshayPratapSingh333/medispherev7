"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Smart Appointments",
    desc: "Book, reschedule, and manage MediSphere sessions easily.",
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
  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_25%,rgba(45,212,191,0.18),transparent_40%),radial-gradient(circle_at_85%_70%,rgba(34,211,238,0.14),transparent_35%)]" />
        </div>

        <div className="relative z-10">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-4"
            >
              Why Choose MediSphere?
            </h2>
            <div
              className="w-16 sm:w-20 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"
            />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="relative p-6 sm:p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden h-full transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-teal-500/20 group-hover:bg-white/15 group-hover:border-white/30">
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <div className="relative mb-6">
                    <div className={`w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-lg`}>
                      <span>{f.icon}</span>
                    </div>
                  </div>

                  <h3
                    className="text-lg sm:text-xl font-bold text-slate-700 mb-2 sm:mb-3 group-hover:text-teal-700 transition-colors duration-300"
                  >
                    {f.title}
                  </h3>

                  <p
                    className="text-sm sm:text-base text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300"
                  >
                    {f.desc}
                  </p>

                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 w-0 group-hover:w-full transition-all duration-300" />
                </div>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-200/10 to-cyan-200/10 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}