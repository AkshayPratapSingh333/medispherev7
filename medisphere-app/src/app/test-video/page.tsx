"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Users, Link as LinkIcon, Zap } from "lucide-react";

export default function VideoTestPage() {
  const router = useRouter();
  const [customRoomId, setCustomRoomId] = useState("");

  const createRandomRoom = () => {
    const roomId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    router.push(`/meet/${roomId}`);
  };

  const joinCustomRoom = () => {
    if (customRoomId.trim()) {
      router.push(`/meet/${customRoomId.trim()}`);
    } else {
      alert("Please enter a room ID");
    }
  };

  const testRooms = [
    { id: "doctor-patient-demo", name: "Doctor-Patient Demo", desc: "Simulated consultation" },
    { id: "multi-party-test", name: "Multi-Party Test", desc: "Test with 3+ participants" },
    { id: "family-consult", name: "Family Consultation", desc: "Doctor + Patient + Family" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-emerald-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              MediSphere Video Testing
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Test your multi-participant video conferencing system
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-cyan-100">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-cyan-500" />
              <h2 className="text-2xl font-bold text-gray-900">Quick Start</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Create an instant test room and invite others
            </p>
            <button
              onClick={createRandomRoom}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition"
            >
              Create Test Room
            </button>
            <p className="text-sm text-gray-500 mt-3 text-center">
              You'll get a unique URL to share
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold text-gray-900">Join Room</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Enter a room ID to join an existing meeting
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={customRoomId}
                onChange={(e) => setCustomRoomId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinCustomRoom()}
                placeholder="e.g., test-room-123"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={joinCustomRoom}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>

        {/* Pre-configured Test Rooms */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">
              Pre-configured Test Rooms
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => router.push(`/meet/${room.id}`)}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-cyan-400 hover:bg-cyan-50 transition group text-left"
              >
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-cyan-700">
                  {room.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{room.desc}</p>
                <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                  {room.id}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📋 Testing Guide
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Single Browser Test
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1. Click "Create Test Room"</li>
                <li>2. Copy the URL from browser</li>
                <li>3. Open in new tab/window (use incognito)</li>
                <li>4. Test video/audio/chat between tabs</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Multi-Participant Test
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1. Open pre-configured test room</li>
                <li>2. Share room ID with team</li>
                <li>3. Join from 3+ different devices</li>
                <li>4. Verify grid layout adjusts</li>
              </ol>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">✅ Features to Test</h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-700">
              <div>• Mute/unmute audio</div>
              <div>• Turn video on/off</div>
              <div>• Screen sharing</div>
              <div>• Chat messages</div>
              <div>• Participant list</div>
              <div>• Copy meeting link</div>
              <div>• Leave/rejoin</div>
              <div>• Multiple participants</div>
              <div>• Grid auto-resize</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => router.push("/meet")}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Go to Meeting Lobby
          </button>
          <button
            onClick={() => router.push("/appointments")}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    </div>
  );
}
