import "./globals.css";
import NextAuthProvider from "../components/providers/NextAuthProvider";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <Header />
          <div className="max-w-6xl mx-auto md:flex">
            <Sidebar />
            <main className="flex-1 p-4">{children}</main>
          </div>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
