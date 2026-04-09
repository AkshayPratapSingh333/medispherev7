"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CHAT_UNREAD_EVENT,
  clearChatUnreadCount,
  getChatUnreadCount,
} from "@/lib/chat-unread";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sync = () => setChatUnreadCount(getChatUnreadCount());
    sync();

    const onUnreadEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ count?: number }>;
      if (typeof customEvent.detail?.count === "number") {
        setChatUnreadCount(customEvent.detail.count);
      } else {
        sync();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "chat_unread_count") sync();
    };

    window.addEventListener(CHAT_UNREAD_EVENT, onUnreadEvent as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CHAT_UNREAD_EVENT, onUnreadEvent as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const inChat = pathname === "/chat" || /\/appointments\/[^/]+\/chat$/.test(pathname || "");
    if (inChat) {
      clearChatUnreadCount();
    }
  }, [pathname]);

  const navItems = [
    { href: "/doctors", label: "Doctors" },
    { href: "/appointments/book", label: "Book" },
    { href: "/reports", label: "Reports" },
    { href: "/chat", label: "Chat" },
  ];

  const bgScrolled =
    "bg-white/90 backdrop-blur-lg border-b border-amber-200/50 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.08)]";
  const bgTop =
    "bg-gradient-to-r from-white/95 via-stone-50/90 to-white/95 backdrop-blur-lg border-b border-amber-200/50 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.06)]";

  // Decide dashboard path by role
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdminAuthorized = userRole === "ADMIN" && Boolean(session?.user?.email);
  const dashHref =
    userRole === "DOCTOR"
      ? "/doctor/dashboard"
      : userRole === "ADMIN"
      ? "/admin"
      : "/patient/dashboard";
  const dashLabel = isAdminAuthorized ? "Admin" : "Dashboard";

  return (
    <motion.header
      className={[
        // Fixed header; content must add pt-14 in layout
        "fixed top-0 left-0 right-0 h-16 z-30",
        // Theme based on scroll
        "transition-colors duration-300",
        isScrolled ? bgScrolled : bgTop,
      ].join(" ")}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      role="banner"
    >
      {/* Content row */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-full flex items-center justify-between">
        {/* Mobile menu button + Brand */}
        <div className="flex items-center gap-2">
          <button
            className="md:hidden inline-flex items-center justify-center size-10 rounded-lg hover:bg-amber-100/50 transition-colors"
            aria-label="Open navigation menu"
            onClick={() => document.getElementById('sidebar-mobile-toggle')?.click()}
          >
            <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <Image
              src="/MedisphereSharpBgRemCrop.png"
              alt="MediSphere logo"
              width={130}
              height={130}
              quality={100}
              className="h-{3px} w-{3px} object-contain"
              priority
            />
          </Link>
        </div>

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
                className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-amber-100/40 transition-transform duration-200 ease-out hover:-translate-y-0.5"
              >
                <span className="inline-flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.href === "/chat" && chatUnreadCount > 0 && (
                    <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
                      {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                    </span>
                  )}
                </span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Auth section */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {status === "loading" ? (
            <span className="text-xs md:text-sm text-stone-500">Loading…</span>
          ) : session?.user ? (
            <>
              <div className="hidden sm:block px-2 sm:px-3 py-1.5 rounded-full bg-amber-100/60 backdrop-blur border border-amber-200/50">
                <span className="text-xs md:text-sm text-stone-700">
                  Hi,{" "}
                  <span className="font-medium text-stone-900">
                    {session.user.name || session.user.email || "User"}
                  </span>
                </span>
              </div>

              <Link
                href={dashHref}
                className="inline-flex items-center px-2 sm:px-3 md:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/20 transition-all duration-200 min-h-[40px] md:min-h-[44px]"
              >
                {dashLabel}
              </Link>

              <motion.button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center px-2 sm:px-3 md:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 min-h-[40px] md:min-h-[44px]"
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
                className="px-2 sm:px-3 md:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-stone-700 border border-amber-200 hover:text-stone-900 hover:bg-amber-100/40 transition min-h-[40px] md:min-h-[44px] flex items-center"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-2 sm:px-3 md:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/20 min-h-[40px] md:min-h-[44px] flex items-center"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    </motion.header>
  );
}
