// components/home/FeaturesSection.tsx
import { Stethoscope, Video, MessageSquare, Shield, FileText, Bell } from "lucide-react";

const features = [
  {
    icon: <Stethoscope className="w-10 h-10 text-green-600" />,
    title: "Expert Doctors",
    desc: "Certified Panchkarma specialists with years of experience.",
  },
  {
    icon: <Video className="w-10 h-10 text-blue-600" />,
    title: "Video Consultations",
    desc: "High-quality, secure telemedicine video calls.",
  },
  {
    icon: <MessageSquare className="w-10 h-10 text-green-600" />,
    title: "Real-Time Chat",
    desc: "Chat with your doctor during or after consultation.",
  },
  {
    icon: <Shield className="w-10 h-10 text-blue-600" />,
    title: "Secure Records",
    desc: "Encrypted uploads of reports and prescriptions.",
  },
  {
    icon: <FileText className="w-10 h-10 text-green-600" />,
    title: "AI Health Assistant",
    desc: "Analyze reports, images, and symptoms with AI.",
  },
  {
    icon: <Bell className="w-10 h-10 text-blue-600" />,
    title: "Medicine Reminders",
    desc: "Get timely reminders for your medications.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-blue-700">
          Our Key Features
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              {f.icon}
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                {f.title}
              </h3>
              <p className="mt-2 text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
