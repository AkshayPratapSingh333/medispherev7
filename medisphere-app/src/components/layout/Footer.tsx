"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  platform: [
    { href: "/doctors", label: "Find Doctors" },
    { href: "/appointments/book", label: "Book Appointment" },
    { href: "/reports", label: "Medical Reports" },
    { href: "/ai", label: "AI Assistant" },
  ],
  support: [
    { href: "/help", label: "Help Center", description: "Step-by-step guidance for appointments, reports, and account settings." },
    { href: "/contact", label: "Contact Us", description: "Reach our care team for platform support and urgent assistance." },
    { href: "/privacy", label: "Privacy Policy", description: "Understand how we protect your personal and medical information." },
    { href: "/terms", label: "Terms of Service", description: "Read the rules and responsibilities for using MediSphere." },
  ],
  company: [
    { href: "/about", label: "About Us", description: "Learn our mission to modernize trusted Ayurvedic care." },
    { href: "/blog", label: "Blog", description: "Read expert insights on wellness, prevention, and digital health." },
    { href: "/careers", label: "Careers", description: "Join our team to build meaningful healthcare experiences." },
    { href: "/press", label: "Press Kit", description: "Access official brand assets, announcements, and media resources." },
  ],
};

export default function Footer() {
  return (
    <motion.footer
      className="relative mt-auto w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-white/10 shadow-[0_-10px_28px_-20px_rgba(0,0,0,0.8)] backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0">
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

        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1200 40" className="w-full h-10">
            <path
              d="M0,20 Q300,0 600,20 T1200,20 L1200,40 L0,40 Z"
              fill="rgba(20, 184, 166, 0.1)"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          {/* Footer Grid */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <motion.div
              className="md:col-span-1"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.08, duration: 0.3 }}
            >
              <motion.div className="mb-4" whileHover={{ scale: 1.02 }}>
                <div className="inline-flex items-center gap-2">
                  <Image
                    src="/MedisphereSharpBgRemCrop.png"
                    alt="MediSphere logo"
                    width={280}
                    height={280}
                    quality={100}
                    className="h-[122px] w-[122px] object-contain"
                  />
                </div>
              </motion.div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Revolutionizing Ayurvedic healthcare through modern technology. 
                Connect with certified practitioners and embark on your wellness journey.
              </p>
            </motion.div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.12 + (categoryIndex * 0.05), duration: 0.3 }}
              >
                <h4 className="font-semibold text-gray-700 mb-4 capitalize">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + (i * 0.03), duration: 0.25 }}
                    >
                      <Link
                        href={link.href}
                        className="block text-sm text-gray-600 hover:text-teal-600 transition-colors duration-300 relative group"
                      >
                        <span className="font-medium">{link.label}</span>
                        {"description" in link && link.description ? (
                          <span className="mt-1 block text-xs leading-relaxed text-gray-500 group-hover:text-teal-600/80">
                            {link.description}
                          </span>
                        ) : null}
                        <span className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 w-0 group-hover:w-full transition-all duration-300 ease-out" />
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
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: 0.12, duration: 0.3 }}
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
                  whileHover={{ scale: 1.03 }}
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
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: 0.16, duration: 0.3 }}
          >
            <div className="text-center md:text-left">
              <div className="text-gray-600 text-sm">
                © {new Date().getFullYear()} MediSphere Telemedicine —{" "}
                <motion.span
                  className="text-teal-700 font-semibold relative inline-block"
                  whileHover={{ scale: 1.02 }}
                >
                  Your Health, Your Way
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-200/20 to-cyan-200/20 blur-sm -z-10 rounded opacity-0 hover:opacity-100 transition-opacity duration-300" />
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
                whileHover={{ scale: 1.02, y: -1 }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Secure & Private</span>
              </motion.div>
              
              <motion.div
                className="flex items-center space-x-1 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200/50"
                whileHover={{ scale: 1.02, y: -1 }}
              >
                <span>🏆</span>
                <span>ISO Certified</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}