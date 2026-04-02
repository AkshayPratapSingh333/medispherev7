"use client";
import { useParams } from "next/navigation";
import MeetingRoomClient from "@/components/video/MeetingRoomClient";

export default function MeetPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  return <MeetingRoomClient roomId={roomId} leavePath="/appointments" />;
}
