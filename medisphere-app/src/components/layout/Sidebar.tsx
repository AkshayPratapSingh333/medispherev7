// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";

export default function Sidebar({ className = "" }: { className?: string }) {
  return (
    <aside className={`w-64 border-r p-4 hidden md:block ${className}`}>
      <nav className="space-y-2 text-sm">
        <Link href="/" className="block">Home</Link>
        <Link href="/doctors" className="block">Doctors</Link>
        <Link href="/appointments/book" className="block">Book Appointment</Link>
        <Link href="/reports" className="block">Reports</Link>
        <Link href="/medicines" className="block">Medicines</Link>
        <Link href="/chat" className="block">Chat</Link>
        <Link href="/ai" className="block">AI Assistant</Link>
        <Link href="/admin" className="block">Admin</Link>
      </nav>
    </aside>
  );
}
