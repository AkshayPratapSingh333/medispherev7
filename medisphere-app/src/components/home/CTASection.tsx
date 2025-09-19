// components/home/CTASection.tsx
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold">Ready to Start Your Panchkarma Journey?</h2>
        <p className="mt-4 text-lg">
          Join thousands of patients who trust us for their health and well-being.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/auth/signup"
            className="bg-white text-blue-700 px-6 py-3 rounded-lg shadow hover:bg-gray-100"
          >
            Sign Up
          </Link>
          <Link
            href="/doctors"
            className="bg-blue-800 px-6 py-3 rounded-lg shadow hover:bg-blue-900"
          >
            Find a Doctor
          </Link>
        </div>
      </div>
    </section>
  );
}
