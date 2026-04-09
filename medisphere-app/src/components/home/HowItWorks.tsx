"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "1",
    title: "Sign Up",
    desc: "Create your free account and join the wellness community.",
    icon: "👤",
    color: "from-emerald-400 to-emerald-500",
  },
  {
    step: "2",
    title: "Find a Doctor",
    desc: "Browse certified practitioners and apply smart filters.",
    icon: "🔍",
    color: "from-emerald-400 to-emerald-500",
  },
  {
    step: "3",
    title: "Book Appointment",
    desc: "Schedule your session easily with flexible timing.",
    icon: "📅",
    color: "from-emerald-400 to-green-500",
  },
  {
    step: "4",
    title: "Video Call",
    desc: "Connect live with your doctor for personalized care.",
    icon: "📹",
    color: "from-emerald-400 to-emerald-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-emerald-50 to-amber-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_12%_25%,rgba(20,184,166,0.16),transparent_35%),radial-gradient(circle_at_88%_72%,rgba(59,130,246,0.16),transparent_40%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: -18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 bg-clip-text text-transparent mb-2 sm:mb-4 px-4">
            How It Works
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
            Your journey to wellness in four simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              className="group relative"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="relative p-6 sm:p-8 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 text-center overflow-hidden h-full transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-teal-500/30 group-hover:bg-white/15 group-hover:border-white/30">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative mb-6 mx-auto">
                  <div className={`w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br ${s.color} rounded-full flex items-center justify-center shadow-lg mx-auto`}>
                    <span className="text-xl sm:text-2xl font-bold text-white">{s.step}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 sm:w-8 h-7 sm:h-8 bg-white/90 rounded-full shadow-md flex items-center justify-center text-base sm:text-lg">
                    {s.icon}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-700 mb-2 sm:mb-3 group-hover:text-teal-700 transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                  {s.desc}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/30 to-transparent">
                  <div className={`h-full bg-gradient-to-r ${s.color} w-0 group-hover:w-full transition-all duration-300`} />
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          <motion.div
            className="inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 text-sm sm:text-base"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="font-semibold">Ready to get started?</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
