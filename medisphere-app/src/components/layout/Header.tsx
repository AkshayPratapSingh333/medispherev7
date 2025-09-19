// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import SignOutButton from "../auth/SignOutButton";

export default function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // determine dashboard route based on role
  const dashboardHref =
    session?.user?.role === "DOCTOR"
      ? "/doctor/dashboard"
      : session?.user?.role === "ADMIN"
      ? "/admin"
      : "/patient/dashboard";

  return (
    <header className="bg-white shadow border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Panchkarma
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/doctors" className="hover:text-blue-600">
            Doctors
          </Link>
          <Link href="/appointments/book" className="hover:text-blue-600">
            Book Appointment
          </Link>
          <Link href="/reports" className="hover:text-blue-600">
            Reports
          </Link>
          <Link href="/chat" className="hover:text-blue-600">
            Chat
          </Link>
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="text-sm text-gray-600">
                Hi, {session.user.name ?? session.user.email}
              </span>
              <Link
                href={dashboardHref}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded hover:bg-gray-100"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <nav className="flex flex-col p-4 gap-4 text-sm font-medium">
            <Link href="/doctors" onClick={() => setMobileOpen(false)}>
              Doctors
            </Link>
            <Link href="/appointments/book" onClick={() => setMobileOpen(false)}>
              Book Appointment
            </Link>
            <Link href="/reports" onClick={() => setMobileOpen(false)}>
              Reports
            </Link>
            <Link href="/chat" onClick={() => setMobileOpen(false)}>
              Chat
            </Link>

            {session?.user ? (
              <>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
