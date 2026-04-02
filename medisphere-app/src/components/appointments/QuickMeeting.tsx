"use client";
import { useState } from "react";
import { Video, Copy, Check, ExternalLink } from "lucide-react";

interface QuickMeetingProps {
  appointmentId: string;
  doctorName?: string;
  patientName?: string;
}

export default function QuickMeeting({
  appointmentId,
  doctorName,
  patientName,
}: QuickMeetingProps) {
  const [meetingLink, setMeetingLink] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      if (res.ok) {
        const data = await res.json();
        setMeetingLink(data.meetingLink);
        setRoomId(data.roomId);
      } else {
        alert("Failed to generate meeting link");
      }
    } catch (err) {
      console.error("Error generating link:", err);
      alert("Error generating link");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    // Copy just the relative path (e.g., /meet/instant-xxx-xxx)
    const linkToCopy = roomId ? `/meet/${roomId}` : meetingLink;
    navigator.clipboard.writeText(linkToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinMeeting = () => {
    window.open(`/appointment/${appointmentId}`, "_blank");
  };

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-xl p-6 border border-cyan-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-cyan-500 rounded-lg">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Video Consultation</h3>
          <p className="text-sm text-gray-600">
            {doctorName && patientName
              ? `${doctorName} with ${patientName}`
              : "Start or join video call"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={joinMeeting}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Video className="w-5 h-5" />
            Join Meeting
          </button>

          <button
            onClick={generateLink}
            disabled={isGenerating}
            className="px-4 py-3 bg-white border border-cyan-200 text-cyan-700 rounded-lg font-semibold hover:bg-cyan-50 transition disabled:opacity-50"
          >
            {isGenerating ? "..." : <ExternalLink className="w-5 h-5" />}
          </button>
        </div>

        {meetingLink && roomId && (
          <div className="bg-white rounded-lg p-3 border border-cyan-200">
            <label className="text-xs text-gray-600 mb-1 block">
              Shareable Link - Copy and share:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`/meet/${roomId}`}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none font-mono"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition"
                title="Copy link to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Only share the /meet/... path, not the full URL
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-cyan-200">
        <p className="text-xs text-gray-600">
          ✓ HD video & audio &nbsp; • &nbsp; ✓ Screen sharing &nbsp; • &nbsp; ✓
          Chat
        </p>
      </div>
    </div>
  );
}
