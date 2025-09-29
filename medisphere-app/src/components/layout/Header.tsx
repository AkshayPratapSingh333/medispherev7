"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { href: "/doctors", label: "Doctors" },
    { href: "/appointments/book", label: "Book" },
    { href: "/reports", label: "Reports" },
    { href: "/chat", label: "Chat" },
  ];

  const bgScrolled =
    "bg-white/90 backdrop-blur-md shadow-lg border-b border-cyan-100";
  const bgTop =
    "bg-gradient-to-r from-teal-50/90 via-cyan-50/90 to-blue-50/90 backdrop-blur-sm shadow-md border-b border-white/30";

  // Decide dashboard path by role
  const dashHref =
    (session?.user as any)?.role === "DOCTOR"
      ? "/doctor/dashboard"
      : (session?.user as any)?.role === "ADMIN"
      ? "/admin"
      : "/patient/dashboard";

  return (
    <motion.header
      className={[
        // Fixed header; content must add pt-14 in layout
        "fixed top-0 left-0 right-0 h-16 z-30",
        // On desktop, pad-left by live sidebar width (set by Sidebar)
        "md:pl-[var(--sidebar-w)] transition-[padding-left] duration-300 ease-out",
        // Theme based on scroll
        "transition-colors duration-300",
        isScrolled ? bgScrolled : bgTop,
      ].join(" ")}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      role="banner"
    >
      {/* Soft animated background accents (subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isClient &&
          [...Array(6)].map((_, i) => (
            <motion.div
              key={`hdr-dot-${i}`}
              className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-30"
              style={{ left: `${12 + i * 12}%`, top: `${30 + i * 6}%` }}
              animate={{ y: [-4, -10, -4], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4 + i * 0.4, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
            />
          ))}
      </div>

      {/* Content row */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Go to home"
        >
          <span className="font-bold text-2xl  text-cyan-800 group-hover:text-cyan-900">
            PanchKarma
          </span>
        </Link>

        {/* Nav (desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item, idx) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <Link
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-teal-700 hover:bg-white/60 transition-colors"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Auth section */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <span className="text-xs text-gray-500">Loading…</span>
          ) : session?.user ? (
            <>
              <div className="hidden sm:block px-3 py-1.5 rounded-full bg-white/60 backdrop-blur ring-1 ring-cyan-200">
                <span className="text-xs text-slate-700">
                  Hi,{" "}
                  <span className="font-medium">
                    {session.user.name || session.user.email || "User"}
                  </span>
                </span>
              </div>

              <Link
                href={dashHref}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-emerald-500 shadow hover:from-cyan-600 hover:to-emerald-600"
              >
                Dashboard
              </Link>

              <motion.button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-500 shadow hover:from-rose-600 hover:to-red-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign out
              </motion.button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 ring-1 ring-cyan-200 hover:text-teal-700 hover:bg-cyan-50"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-emerald-500 shadow hover:from-cyan-600 hover:to-emerald-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom shimmer line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.header>
  );
}
