"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CHAT_UNREAD_EVENT,
  clearChatUnreadCount,
  getChatUnreadCount,
} from "@/lib/chat-unread";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/appointments/book", label: "Book" },
  { href: "/reports", label: "Reports" },
  { href: "/medicines", label: "Medicines & Disease" },
  { href: "/chat", label: "Chat" },
  { href: "/ai", label: "AI Assistant" },
];

const Dot = () => <span className="text-emerald-700/80">•</span>;

export default function Sidebar() {
  const pathname = usePathname();

  // Collapsed state (desktop)
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer open
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("sb_collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  // Publish sidebar width as CSS var so Header/Main can offset
  useEffect(() => {
    const w = collapsed ? "4rem" : "16rem"; // 64px vs 256px
    document.documentElement.style.setProperty("--sidebar-w", w);
    localStorage.setItem("sb_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // Header height variable (fallback 56px if not set)
  useEffect(() => {
    const existing = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-h")
      .trim();
    if (!existing) {
      document.documentElement.style.setProperty("--header-h", "64px"); // h-16
    }
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

  const width = collapsed ? 64 : 256;

  const linkBase =
    "relative group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition duration-200";
  const linkClass = (active: boolean) =>
    active
      ? "bg-gradient-to-r from-emerald-500/20 to-emerald-400/15 text-stone-900 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-500/10"
      : "text-stone-600 hover:text-stone-900 hover:bg-amber-100/30";

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
    const showChatUnread = href === "/chat" && chatUnreadCount > 0;
    return (
      <li className="list-none" title={collapsed ? label : undefined}>
        <Link
          href={href}
          className={`${linkBase} ${linkClass(active)}`}
          aria-current={active ? "page" : undefined}
        >
          
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="truncate"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {showChatUnread && (
            <span className="ml-auto inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
            </span>
          )}

          {active && (
            <span className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR: below header */}
      <motion.aside
        initial={false}
        animate={{ width }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        style={{
          width,
          top: "var(--header-h, 56px)",
          height: "calc(100vh - var(--header-h, 56px))",
        }}
        className={[
          "hidden md:block",
          "fixed left-0",
          // lies BELOW header; header should have z-30, we go z-20
          "z-20",
          "bg-gradient-to-b from-white/80 via-stone-50/75 to-white/80",
          "border-r border-amber-200/40 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.05)]",
          "backdrop-blur-sm",
        ].join(" ")}
      >
        {/* Row: title + collapse toggle */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            {mounted && !collapsed && (
              <span className="text-base font-semibold tracking-wide bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                MediSphere
              </span>
            )}
          </div>

        {/* Collapse toggle */}
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex items-center justify-center size-8 rounded-md ring-1 ring-amber-200/60 text-stone-700 bg-amber-100/40 hover:bg-amber-100/60 transition-all duration-200"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <span className="text-xl leading-none select-none">{collapsed ? "»" : "«"}</span>
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

        {!collapsed && (
          <ul className="px-3 py-3 space-y-2 overflow-y-auto h-[calc(100%-64px-1px)]">
            {NAV.map((it) => (
              <NavLink key={it.href} {...it} />
            ))}
          </ul>
        )}

        {/* Right glow divider */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
      </motion.aside>

      {/* MOBILE DRAWER: opens under header */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              className="md:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              className="md:hidden fixed left-0 w-64 z-50 bg-gradient-to-b from-white/90 via-stone-50/85 to-white/90 border-r border-amber-200/40 shadow-2xl backdrop-blur-sm"
              style={{
                top: "var(--header-h, 56px)",
                height: "calc(100vh - var(--header-h, 56px))",
              }}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <ul className="px-3 py-3 space-y-2 overflow-y-auto h-full">
                {NAV.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={`${linkBase} ${linkClass(
                        pathname === it.href || (it.href !== "/" && pathname?.startsWith(it.href))
                      )}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="inline-flex size-8 items-center justify-center rounded-md bg-emerald-600/20 ring-1 ring-emerald-400/50 text-emerald-600">
                        <Dot />
                      </span>
                      <span>{it.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Export control via data attribute for Header to hook into */}
      <button
        id="sidebar-mobile-toggle"
        className="hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-hidden="true"
      />
    </>
  );
}
