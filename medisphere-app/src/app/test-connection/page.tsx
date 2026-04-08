"use client";
import { useRouter } from "next/navigation";
import { Video, Users, FileText } from "lucide-react";

export default function ConnectionTestPage() {
  const router = useRouter();
  const testRoomId = "connection-test-room";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔧 Connection Test Page
          </h1>
          <p className="text-gray-300 text-lg">
            Test video connections between doctor and patient
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Doctor Test */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Doctor</h2>
                <p className="text-gray-600">Open this in one browser</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Step 1:</strong> Open this link in <strong>Chrome</strong>
                </p>
                <code className="text-xs bg-white px-2 py-1 rounded border text-blue-600 block overflow-x-auto">
                  http://localhost:3000/meet/{testRoomId}
                </code>
              </div>

              <button
                onClick={() => router.push(`/meet/${testRoomId}`)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Join as Doctor
              </button>

              <p className="text-xs text-gray-500 text-center">
                This will open the meeting room
              </p>
            </div>
          </div>

          {/* Patient Test */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Patient</h2>
                <p className="text-gray-600">Open this in another browser</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Step 2:</strong> Open this link in <strong>Firefox/Incognito</strong>
                </p>
                <code className="text-xs bg-white px-2 py-1 rounded border text-green-600 block overflow-x-auto">
                  http://localhost:3000/meet/{testRoomId}
                </code>
              </div>

              <button
                onClick={() => window.open(`/meet/${testRoomId}`, '_blank')}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Join as Patient (New Tab)
              </button>

              <p className="text-xs text-gray-500 text-center">
                Opens in new tab/window
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-600" />
            Testing Instructions
          </h3>
          <ol className="space-y-3 text-sm text-gray-800">
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">1.</span>
              <span>Click <strong>&quot;Join as Doctor&quot;</strong> button (opens in current tab)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">2.</span>
              <span>Allow camera &amp; microphone permissions</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">3.</span>
              <span>Click <strong>&quot;Join as Patient&quot;</strong> button (opens in new tab/window)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">4.</span>
              <span>Allow camera &amp; microphone on second window</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">5.</span>
              <span>Wait 3-5 seconds - you should see both videos!</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">6.</span>
              <span>Click <strong>🔧 Diagnostics</strong> (bottom-left) to check connection status</span>
            </li>
          </ol>
        </div>

        {/* Expected Results */}
        <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">✅ Expected Results:</h3>
          <ul className="space-y-2 text-sm text-gray-800">
            <li>✓ Both windows show 2 video tiles (yours + other person)</li>
            <li>✓ Diagnostics shows &quot;Socket Connected: ✓ Yes&quot;</li>
            <li>✓ Diagnostics shows &quot;Room Joined: ✓ Yes&quot;</li>
            <li>✓ Diagnostics shows &quot;Peer Connections: 1&quot;</li>
            <li>✓ Peer state shows &quot;connected&quot; (green)</li>
            <li>✓ Chat messages sync between both windows</li>
          </ul>
        </div>

        {/* Troubleshooting Link */}
        <div className="mt-6 text-center">
          <a
            href="/TROUBLESHOOTING.md"
            target="_blank"
            className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            📖 Full Troubleshooting Guide
          </a>
        </div>
      </div>
    </div>
  );
}
