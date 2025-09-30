// app/page.tsx
"use client";



// import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";
import CTASection from "../components/home/CTASection";

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative  w-fit min-h-screen overflow-hidden md:ml-64">
      {/* Enhanced Background Layers */}
      <div className="fixed inset-0 -z-10">
        {/* Primary Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50" />
        {/* Secondary Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-50/80 via-transparent to-blue-50/60" />
        {/* Static Mesh Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-cyan-100/40 to-blue-100/30" />
        {/* Static Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px, 150px 150px, 120px 120px",
            }}
          />
        </div>
        {/* Static Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Static Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content Sections with Enhanced Spacing */}
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        {/* Section Divider */}
        <div className="h-20 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        {/* Features Section */}
        <FeaturesSection />
        {/* Section Divider */}
        <div className="h-16 bg-gradient-to-b from-transparent via-cyan-50/40 to-transparent" />
        {/* How It Works Section */}
        <HowItWorks />
        {/* Section Divider */}
        <div className="h-16 bg-gradient-to-b from-transparent via-emerald-50/40 to-transparent" />
        {/* Testimonials Section */}
        <Testimonials />
        {/* Final CTA Section */}
        <CTASection />
      </div>
      {/* Removed Scroll Progress Indicator Animation */}
    </div>
  );
}