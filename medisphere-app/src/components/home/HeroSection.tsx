// components/home/HeroSection.tsx
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-white py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-700">
          Panchkarma
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with certified doctors, book Panchkarma sessions, 
          and manage your health from the comfort of your home.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/auth/signup"
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700"
          >
            Get Started
          </Link>
          <Link
            href="/doctors"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
          >
            Find Doctors
          </Link>
        </div>
      </div>
    </section>
  );
}
