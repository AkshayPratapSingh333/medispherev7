"use client";

export default function VideoControls() {
  return (
    <div className="space-x-2 mt-2">
      <button className="px-3 py-1 bg-red-600 text-white rounded">End Call</button>
      <button className="px-3 py-1 bg-gray-200 rounded">Mute</button>
      <button className="px-3 py-1 bg-gray-200 rounded">Share Screen</button>
    </div>
  );
}
