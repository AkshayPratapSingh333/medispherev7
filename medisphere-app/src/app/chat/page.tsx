"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageSquare, Video, Users, Plus, Search } from "lucide-react";

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  doctor?: { user: { name: string; image?: string } };
  patient?: { user: { name: string; image?: string } };
}

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const doctorName = appt.doctor?.user?.name || "";
    const patientName = appt.patient?.user?.name || "";
    return (
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const startInstantMeeting = () => {
    const roomId = `instant-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    router.push(`/meet/${roomId}`);
  };

  const openAppointmentChat = (appointmentId: string) => {
    router.push(`/appointments/${appointmentId}/chat`);
  };

  const startVideoCall = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-cyan-50 to-emerald-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Chat</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your conversations</p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg font-semibold hover:opacity-90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-emerald-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages & Calls</h1>
              <p className="text-gray-600">
                Chat with your {session.user.role === "DOCTOR" ? "patients" : "doctors"} and start video calls
              </p>
            </div>
            <button
              onClick={startInstantMeeting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              <Video className="w-5 h-5" />
              New Meeting
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={startInstantMeeting}
            className="p-6 bg-white rounded-xl border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 transition group text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition">
                <Video className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Start Video Call</h3>
            </div>
            <p className="text-sm text-gray-600">Create an instant video meeting</p>
          </button>

          <button
            onClick={() => router.push("/meet")}
            className="p-6 bg-white rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition group text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Join Meeting</h3>
            </div>
            <p className="text-sm text-gray-600">Enter meeting code or link</p>
          </button>

          <button
            onClick={() => router.push("/appointments")}
            className="p-6 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition group text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Appointments</h3>
            </div>
            <p className="text-sm text-gray-600">View all scheduled appointments</p>
          </button>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Conversations
              {filteredAppointments.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredAppointments.length})
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <p className="mt-4 text-gray-600">Loading conversations...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "No conversations match your search"
                  : "Start by booking an appointment or creating a meeting"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push("/appointments/book")}
                  className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                >
                  Book Appointment
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAppointments.map((appointment) => {
                const otherPerson =
                  session.user.role === "DOCTOR" ? appointment.patient : appointment.doctor;
                const scheduledDate = new Date(appointment.scheduledAt);
                const isPast = scheduledDate < new Date();
                const isUpcoming = !isPast && scheduledDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;

                return (
                  <div
                    key={appointment.id}
                    className="p-6 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => openAppointmentChat(appointment.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white text-xl font-bold">
                          {otherPerson?.user?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        {isUpcoming && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherPerson?.user?.name || "Unknown"}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : appointment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {scheduledDate.toLocaleDateString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAppointmentChat(appointment.id);
                          }}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                          title="Open chat"
                        >
                          <MessageSquare className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startVideoCall(appointment.id);
                          }}
                          className="p-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 rounded-lg transition"
                          title="Start video call"
                        >
                          <Video className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Click <strong>New Meeting</strong> to start an instant video call and share the link</li>
            <li>• Use the <strong>Video Call</strong> button to join appointment consultations</li>
            <li>• Search conversations by doctor or patient name</li>
            <li>• Chat messages are saved and synced in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

