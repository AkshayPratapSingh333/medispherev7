import "./globals.css";
import NextAuthProvider from "../components/providers/NextAuthProvider";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <NextAuthProvider>
          <Sidebar />
          

          <div className="pt-14 md:pt-0 md:pl-[var(--sidebar-w)] transition-[padding-left] duration-300 ease-out">
          <Header />
            <main className="flex-1 p-4">{children}</main>
          </div>
          <Footer />
          {/* Keep toaster near the end so it overlays globally, not inside the grid */}
          <Toaster richColors closeButton theme="system" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
