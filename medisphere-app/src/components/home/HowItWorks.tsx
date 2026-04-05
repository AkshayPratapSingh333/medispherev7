"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "1",
    title: "Sign Up",
    desc: "Create your free account and join the wellness community.",
    icon: "👤",
    color: "from-blue-400 to-cyan-500",
  },
  {
    step: "2",
    title: "Find a Doctor",
    desc: "Browse certified practitioners and apply smart filters.",
    icon: "🔍",
    color: "from-teal-400 to-emerald-500",
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
    color: "from-cyan-400 to-blue-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_12%_25%,rgba(20,184,166,0.16),transparent_35%),radial-gradient(circle_at_88%_72%,rgba(59,130,246,0.16),transparent_40%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your journey to wellness in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
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
              <div className="relative p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-md border border-gray-100 text-center overflow-hidden h-full transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-100/40">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative mb-6 mx-auto">
                  <div className={`w-20 h-20 bg-gradient-to-br ${s.color} rounded-full flex items-center justify-center shadow-lg mx-auto`}>
                    <span className="text-2xl font-bold text-white">{s.step}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-lg">
                    {s.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-700 mb-3 group-hover:text-teal-700 transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                  {s.desc}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                  <div className={`h-full bg-gradient-to-r ${s.color}`} />
                </div>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 z-20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="#14b8a6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="font-semibold">Ready to get started?</span>
            <span>→</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
