"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SignOutButton from "../auth/SignOutButton";

export default function Header() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/doctors", label: "Doctors" },
    { href: "/appointments/book", label: "Book" },
    { href: "/reports", label: "Reports" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
          : "bg-gradient-to-r from-teal-50/90 via-cyan-50/90 to-blue-50/90 backdrop-blur-sm border-b border-white/20 shadow-md"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {isClient && [...Array(8)].map((_, i) => (
          <motion.div
            key={`header-particle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-30"
            style={{
              left: `${10 + (i * 10)}%`,
              top: `${30 + (i * 5)}%`,
            }}
            animate={{
              y: [-5, -15, -5],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -top-10 -right-10 w-16 h-16 bg-gradient-to-bl from-blue-200/20 to-teal-200/20 rounded-full blur-xl"
          animate={{
            x: [0, -25, 0],
            y: [0, -15, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Enhanced Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/"
            className="relative group flex items-center space-x-2"
          >
            <motion.div
              className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent"
              whileHover={{ 
                background: "linear-gradient(to right, #0891b2, #0d9488, #3b82f6)",
                textShadow: "0 0 20px rgba(20, 184, 166, 0.3)"
              }}
            >
              Panchkarma
            </motion.div>
            
            {/* Logo Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-teal-300/20 to-blue-300/20 blur-lg -z-10 rounded-lg opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            
            {/* Animated Underline */}
            <motion.div
              className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 w-0 group-hover:w-full"
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </Link>
        </motion.div>

        {/* Enhanced Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -2 }}
            >
              <Link
                href={item.href}
                className="relative group px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/20 backdrop-blur-sm"
              >
                <span className="font-medium text-gray-700 group-hover:text-teal-600 transition-colors duration-300">
                  {item.label}
                </span>
                
                {/* Hover Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 rounded-lg opacity-0 group-hover:opacity-100 -z-10"
                  transition={{ duration: 0.3 }}
                />
                
                {/* Animated Border */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 w-0 group-hover:w-full"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </Link>
            </motion.div>
          ))}
        </nav>

       {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : session?.user ? (
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Greeting */}
              <div className="px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                <span className="text-sm text-slate-700 font-medium">
                  Hi, {session.user.name ?? "User"}
                </span>
              </div>

              {/* Dashboard */}
              <Link
                href={
                  session.user.role === "DOCTOR"
                    ? "/doctor/dashboard"
                    : session.user.role === "ADMIN"
                    ? "/admin"
                    : "/patient/dashboard"
                }
                className="relative px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg"
              >
                Dashboard
              </Link>

              {/* Sign Out */}
              <motion.button
                onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign out
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/auth/signin"
                className="px-5 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:border-teal-400 hover:text-teal-600 transition-all duration-300 hover:bg-teal-50/50"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
              >
                Sign up
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Glow Line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-300/50 to-transparent"
        animate={{
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.header>
  );
}