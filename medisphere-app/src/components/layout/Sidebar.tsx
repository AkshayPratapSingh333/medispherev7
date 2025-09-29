"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/appointments/book", label: "Book" },
  { href: "/reports", label: "Reports" },
  { href: "/medicines", label: "Medicines" },
  { href: "/chat", label: "Chat" },
  { href: "/ai", label: "AI Assistant" },
  { href: "/admin", label: "Admin" },
];

const Dot = () => <span className="text-cyan-700/80">•</span>;

export default function Sidebar() {
  const pathname = usePathname();

  // Collapsed state (desktop)
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer open
  const [mobileOpen, setMobileOpen] = useState(false);

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
      document.documentElement.style.setProperty("--header-h", "56px"); // h-14
    }
  }, []);

  const width = collapsed ? 64 : 256;

  const linkBase =
    "relative group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200";
  const linkClass = (active: boolean) =>
    active
      ? "bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-800 ring-1 ring-teal-200"
      : "text-gray-700 hover:text-teal-700 hover:bg-white/70";

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
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

          {active && (
            <span className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400" />
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
          "bg-gradient-to-b from-white/95 via-teal-50/40 to-cyan-50/40 backdrop-blur-md",
          "border-r border-cyan-100/70 shadow-lg",
        ].join(" ")}
      >
        {/* Row: title + collapse toggle */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
           
            {!collapsed && (
              <div className="text-cyan-800 font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-emerald-700">
                  Panchkarma
                </span>
              </div>
            )}
          </div>

        {/* Collapse toggle */}
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex items-center justify-center size-8 rounded-md ring-1 ring-cyan-200 text-cyan-700 bg-white hover:bg-cyan-50"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <span className="text-xl leading-none select-none">{collapsed ? "»" : "«"}</span>
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />

        <ul className="px-3 py-3 space-y-2 overflow-y-auto h-[calc(100%-64px-1px)]">
          {NAV.map((it) => (
            <NavLink key={it.href} {...it} />
          ))}
        </ul>

        {/* Right glow divider */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-teal-300/50 to-transparent" />
      </motion.aside>

      {/* MOBILE DRAWER: opens under header */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              className="md:hidden fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              className="md:hidden fixed left-0 w-64 z-50 bg-gradient-to-b from-white to-cyan-50 border-r border-cyan-100 shadow-xl"
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
                      <span className="inline-flex size-8 items-center justify-center rounded-md bg-cyan-600/10 ring-1 ring-cyan-200 text-cyan-700">
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

      {/* MOBILE TRIGGER BUTTON (since header is separate) */}
      <button
        className="md:hidden fixed left-3 top-[calc(var(--header-h,56px)+0.5rem)] z-30 inline-flex items-center justify-center size-10 rounded-lg ring-1 ring-cyan-200 bg-white/90 text-cyan-700 shadow"
        aria-label="Open sidebar"
        onClick={() => setMobileOpen(true)}
      >
        ☰
      </button>
    </>
  );
}
