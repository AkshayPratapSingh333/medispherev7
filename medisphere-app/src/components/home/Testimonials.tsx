"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Arjun Kumar",
    role: "Patient",
    text: "MediSphere made it so easy to consult Ayurvedic doctors from home! The video quality is excellent and the doctors are truly knowledgeable.",
    avatar: "👨",
    rating: 5,
    location: "Mumbai, India",
    gradient: "from-emerald-400 to-emerald-500"
  },
  {
    name: "Dr. Meera Sharma",
    role: "Ayurvedic Practitioner",
    text: "Managing appointments and patients has never been smoother. The platform is intuitive and helps me provide better care to my patients.",
    avatar: "👩‍⚕️",
    rating: 5,
    location: "Delhi, India",
    gradient: "from-emerald-400 to-emerald-500"
  },
  {
    name: "Priya Nair",
    role: "Wellness Enthusiast",
    text: "The AI health assistant feature is incredible! It helps me understand my reports and provides personalized wellness recommendations.",
    avatar: "👩",
    rating: 5,
    location: "Bangalore, India",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    name: "Rajesh Gupta",
    role: "Senior Citizen",
    text: "As someone who finds technology challenging, this platform is surprisingly user-friendly. My grandchildren helped me set it up initially.",
    avatar: "👴",
    rating: 4,
    location: "Pune, India",
    gradient: "from-orange-400 to-red-500"
  },
];

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex space-x-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={i}
          className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.2 }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-stone-50 via-emerald-50 to-amber-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_10%_20%,rgba(45,212,191,0.18),transparent_35%),radial-gradient(circle_at_90%_70%,rgba(59,130,246,0.18),transparent_40%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Enhanced Heading */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35 }}
        >
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 bg-clip-text text-transparent mb-2 sm:mb-4 px-4"
          >
            What Our Users Say
          </h2>
          <motion.p
            className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Real stories from our community of patients and practitioners
          </motion.p>
        </motion.div>

        {/* Featured Testimonial Carousel */}
        <motion.div
          className="mb-16 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
        >
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 overflow-hidden"
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonials[currentSlide].gradient} opacity-5`} />

              <div className="absolute top-4 left-4 text-6xl text-teal-200 font-serif">
                &quot;
              </div>

              <div className="relative z-10">
                <StarRating rating={testimonials[currentSlide].rating} />
                
                <motion.p
                  className="text-xl md:text-2xl text-slate-700 italic mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.25 }}
                >
                  &quot;{testimonials[currentSlide].text}&quot;
                </motion.p>
                
                <div className="flex items-center space-x-4">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${testimonials[currentSlide].gradient} rounded-full flex items-center justify-center text-2xl shadow-lg`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {testimonials[currentSlide].avatar}
                  </motion.div>
                  
                  <div>
                    <motion.h4
                      className="font-bold text-lg text-slate-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12, duration: 0.25 }}
                    >
                      {testimonials[currentSlide].name}
                    </motion.h4>
                    <motion.p
                      className="text-teal-600 font-semibold"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.16, duration: 0.25 }}
                    >
                      {testimonials[currentSlide].role}
                    </motion.p>
                    <motion.p
                      className="text-sm text-slate-500"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.25 }}
                    >
                      📍 {testimonials[currentSlide].location}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Carousel Indicators */}
            <div className="flex justify-center space-x-3 mt-6">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === currentSlide 
                      ? 'bg-teal-500 scale-125' 
                      : 'bg-gray-300 hover:bg-teal-300'
                  }`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={`${t.name}-grid`}
              className="group relative"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 h-full overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-teal-100/50">
                
                <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Avatar */}
                <motion.div
                  className={`w-12 h-12 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center text-lg mb-4 shadow-md`}
                  whileHover={{ scale: 1.05 }}
                >
                  {t.avatar}
                </motion.div>

                {/* Star Rating */}
                <div className="flex space-x-1 mb-3">
                  {[...Array(5)].map((_, starIndex) => (
                    <span
                      key={starIndex}
                      className={`text-sm ${starIndex < t.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <motion.p
                  className="text-slate-600 italic mb-4 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300"
                  whileHover={{ x: 2 }}
                >
                  &quot;{t.text.substring(0, 100)}&quot;...
                </motion.p>

                {/* User Info */}
                <div>
                  <motion.h4
                    className="font-semibold text-slate-700 group-hover:text-teal-700 transition-colors duration-300"
                    whileHover={{ x: 2 }}
                  >
                    {t.name}
                  </motion.h4>
                  <p className="text-xs text-teal-600 font-medium">{t.role}</p>
                  <p className="text-xs text-slate-400">📍 {t.location}</p>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-teal-200 rounded-2xl transition-all duration-300" />
              </div>

              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${t.gradient} blur-xl -z-10 opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className="flex flex-wrap justify-center items-center space-x-8 space-y-4">
            <motion.div
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.03, y: -1 }}
            >
              <span className="text-2xl">⭐</span>
              <span className="text-slate-700 font-semibold">4.8/5 Rating</span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.03, y: -1 }}
            >
              <span className="text-2xl">👥</span>
              <span className="text-slate-700 font-semibold">10,000+ Users</span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.03, y: -1 }}
            >
              <span className="text-2xl">🏆</span>
              <span className="text-slate-700 font-semibold">Award Winning</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}