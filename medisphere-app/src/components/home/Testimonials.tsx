// components/home/Testimonials.tsx
const testimonials = [
  {
    name: "Ravi Sharma",
    role: "Patient",
    text: "Booking my Panchkarma therapy online was seamless. The doctor consultation was top-notch.",
  },
  {
    name: "Dr. Meena Kapoor",
    role: "Doctor",
    text: "The platform makes managing schedules and patient records incredibly easy.",
  },
  {
    name: "Anjali Gupta",
    role: "Patient",
    text: "I love the medicine reminders and secure video calls. Highly professional service.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-700">What Our Users Say</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-blue-50 rounded-xl p-6 shadow-md hover:shadow-lg transition"
            >
              <p className="text-gray-700 italic">“{t.text}”</p>
              <div className="mt-4 font-semibold text-green-700">{t.name}</div>
              <div className="text-sm text-gray-500">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
