// app/page.tsx
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";
import CTASection from "../components/home/CTASection";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-green-50 min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </div>
  );
}
