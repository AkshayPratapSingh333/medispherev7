"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const footerLinks = {
  platform: [
    { href: "/doctors", label: "Find Doctors" },
    { href: "/appointments/book", label: "Book Appointment" },
    { href: "/reports", label: "Medical Reports" },
    { href: "/ai", label: "AI Assistant" },
  ],
  support: [
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Contact Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/press", label: "Press Kit" },
  ],
};

export default function Footer() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.footer
      className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 border-t border-gray-200/50 overflow-hidden md:ml-80"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        {isClient && [...Array(5)].map((_, i) => (
          <motion.div
            key={`footer-orb-${i}`}
            className="absolute w-24 h-24 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-2xl"
            style={{
              left: `${10 + (i * 20)}%`,
              top: `${20 + (i * 10)}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8 + (i * 2),
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px, 80px 80px",
            }}
          />
        </div>

        {/* Top Wave */}
        <motion.div
          className="absolute top-0 left-0 right-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <svg viewBox="0 0 1200 40" className="w-full h-10">
            <motion.path
              d="M0,20 Q300,0 600,20 T1200,20 L1200,40 L0,40 Z"
              fill="rgba(20, 184, 166, 0.1)"
              animate={{
                d: [
                  "M0,20 Q300,0 600,20 T1200,20 L1200,40 L0,40 Z",
                  "M0,15 Q300,35 600,15 T1200,15 L1200,40 L0,40 Z",
                  "M0,20 Q300,0 600,20 T1200,20 L1200,40 L0,40 Z",
                ],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          {/* Footer Grid */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <motion.div
              className="md:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.h3
                className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4"
                whileHover={{ scale: 1.05 }}
              >
                Panchkarma
              </motion.h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Revolutionizing Ayurvedic healthcare through modern technology. 
                Connect with certified practitioners and embark on your wellness journey.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {['Twitter', 'Facebook', 'LinkedIn', 'Instagram'].map((social, i) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full flex items-center justify-center text-gray-600 hover:text-teal-600 transition-colors duration-300 backdrop-blur-sm border border-white/20"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1), duration: 0.4 }}
                  >
                    <span className="text-sm font-medium">
                      {social.slice(0, 1)}
                    </span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (categoryIndex * 0.1), duration: 0.6 }}
              >
                <h4 className="font-semibold text-gray-700 mb-4 capitalize">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.05), duration: 0.4 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-teal-600 transition-colors duration-300 relative group"
                      >
                        <span>{link.label}</span>
                        <motion.div
                          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 w-0 group-hover:w-full"
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter Section */}
          <motion.div
            className="border-t border-gray-200/50 pt-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="max-w-md mx-auto text-center">
              <h4 className="font-semibold text-gray-700 mb-3">
                Stay Updated with Wellness Tips
              </h4>
              <div className="flex rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-transparent text-sm text-gray-700 placeholder-gray-500 outline-none"
                />
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium text-sm hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div
            className="border-t border-gray-200/50 pt-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="text-center md:text-left">
              <div className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Panchkarma Telemedicine —{" "}
                <motion.span
                  className="text-teal-700 font-semibold relative inline-block"
                  whileHover={{ scale: 1.05 }}
                >
                  Your Health, Your Way
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-teal-200/20 to-cyan-200/20 blur-sm -z-10 rounded opacity-0 hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                </motion.span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Certified Ayurvedic practitioners • Secure consultations • AI-powered insights
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <motion.div
                className="flex items-center space-x-1 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200/50"
                whileHover={{ scale: 1.05, y: -1 }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Secure & Private</span>
              </motion.div>
              
              <motion.div
                className="flex items-center space-x-1 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200/50"
                whileHover={{ scale: 1.05, y: -1 }}
              >
                <span>🏆</span>
                <span>ISO Certified</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Floating Particles */}
        {isClient && [...Array(8)].map((_, i) => (
          <motion.div
            key={`footer-particle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-60"
            style={{
              left: `${15 + (i * 10)}%`,
              bottom: `${20 + (i * 5)}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.footer>
  );
}