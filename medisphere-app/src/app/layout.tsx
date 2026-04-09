import "./globals.css";
import NextAuthProvider from "../components/providers/NextAuthProvider";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import PageTransition from "../components/layout/PageTransition";
import IncomingCallModal from "../components/video/IncomingCallModal";
import { Toaster } from "sonner";
import ChatNotificationListener from "../components/chat/ChatNotificationListener";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50">
        <NextAuthProvider>
          <Sidebar />

          <div className="pointer-events-none fixed inset-0 -z-10 opacity-30 bg-[radial-gradient(circle_at_20%_12%,rgba(120,80,50,0.08),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(34,197,94,0.12),transparent_34%)]" />

          <div className="min-h-screen flex flex-col md:pl-[var(--sidebar-w)] transition-[padding-left] duration-300 ease-out">
            <Header />
            <main className="flex-1 pt-16 p-4 w-full">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>

          {/* Global Incoming Call Modal - always listening for incoming calls */}
          <IncomingCallModal />
          {/* Global chat listener for toast + unread badge updates */}
          <ChatNotificationListener />
          {/* Keep toaster near the end so it overlays globally, not inside the grid */}
          <Toaster richColors closeButton theme="system" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
