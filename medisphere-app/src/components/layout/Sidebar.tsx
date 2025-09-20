// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/appointments/book", label: "Book Appointment" },
  { href: "/reports", label: "Reports" },
  { href: "/medicines", label: "Medicines" },
  { href: "/chat", label: "Chat" },
  { href: "/ai", label: "AI Assistant" },
  { href: "/admin", label: "Admin" },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.aside
      className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white/95 via-teal-50/30 to-cyan-50/30 backdrop-blur-md border-r border-gray-200/50 shadow-lg hidden md:block overflow-hidden z-40 ${className}`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {isClient && [...Array(6)].map((_, i) => (
          <motion.div
            key={`sidebar-particle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full opacity-40"
            style={{
              left: `${20 + (i * 8)}%`,
              top: `${15 + (i * 12)}%`,
            }}
            animate={{
              y: [-10, -25, -10],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + (i * 0.8),
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-20 -right-8 w-20 h-20 bg-gradient-to-tl from-blue-200/20 to-teal-200/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut",
          }}
        />

        {/* Vertical Gradient Line */}
        <motion.div
          className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-teal-300/30 to-transparent"
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 p-6 h-full overflow-y-auto">
        {/* Sidebar Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Navigation
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
        </motion.div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ x: 8 }}
                className="relative"
              >
                <Link
                  href={item.href}
                  className={`
                    relative group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-700 shadow-sm border border-teal-200/50' 
                      : 'text-gray-600 hover:text-teal-600 hover:bg-white/50'
                    }
                  `}
                >
                  <span className="relative z-10">{item.label}</span>
                  
                  {/* Active State Background */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-teal-100/50 to-cyan-100/50 rounded-xl"
                      layoutId="activeBackground"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Hover Background */}
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 rounded-xl opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Left Border Indicator */}
                  <motion.div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ${
                      isActive 
                        ? 'h-8 bg-gradient-to-b from-teal-400 to-cyan-400' 
                        : 'h-0 bg-teal-400 group-hover:h-4'
                    }`}
                  />
                  
                  {/* Right Arrow for Active */}
                  {isActive && (
                    <motion.div
                      className="absolute right-3 text-teal-500"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        →
                      </motion.span>
                    </motion.div>
                  )}
                  
                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-teal-200/20 to-cyan-200/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 -z-10"
                    transition={{ duration: 0.3 }}
                  />
                </Link>

                {/* Floating Dots for Active Item */}
                {isActive && isClient && [...Array(3)].map((_, idx) => (
                  <motion.div
                    key={`active-dot-${idx}`}
                    className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-60"
                    style={{
                      right: `${8 + (idx * 4)}px`,
                      top: `${12 + (idx * 2)}px`,
                    }}
                    animate={{
                      y: [-2, -8, -2],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: idx * 0.3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Decoration */}
        <motion.div
          className="mt-12 pt-6 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`bottom-dot-${i}`}
                className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Subtle Brand Text */}
          <motion.p
            className="text-xs text-gray-400 text-center mt-3"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Panchkarma Platform
          </motion.p>
        </motion.div>
      </div>

      {/* Right Border Glow */}
      <motion.div
        className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-teal-300/50 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.aside>
  );
}