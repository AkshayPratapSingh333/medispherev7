// components/home/HowItWorks.tsx
const steps = [
  { title: "Sign Up", desc: "Create your Panchkarma account in minutes." },
  { title: "Book Appointment", desc: "Choose your doctor & preferred time slot." },
  { title: "Consult Online", desc: "Join secure video calls & chat with doctors." },
  { title: "Get Reports & Prescriptions", desc: "View and download securely anytime." },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-green-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-green-700">How It Works</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-blue-600">{i + 1}</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">{s.title}</h3>
              <p className="mt-2 text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
