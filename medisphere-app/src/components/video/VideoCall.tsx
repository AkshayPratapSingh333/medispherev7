'use client';

import { useRef, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSocketClient } from '@/hooks/use-socket-client';
import { useWebRTCCall } from '@/hooks/use-webrtc-call';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  appointmentId: string;
  doctorId: string;
  patientId: string;
}

interface ParticipantInfo {
  name?: string;
}

export default function VideoCall({ appointmentId, doctorId, patientId }: VideoCallProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { emit, on, off } = useSocketClient();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [otherParticipantInfo, setOtherParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [callStatus, setCallStatus] = useState<string>('Connecting...');

  // Determine if current user is doctor (initiator)
  const isDoctor = session?.user?.id === doctorId;

  const { localStream, remoteStream, isConnected, toggleAudio, toggleVideo, endCall, connectionState } =
    useWebRTCCall({
      meetingId: appointmentId,
      isInitiator: isDoctor,
      onConnectionStateChange: (state) => {
        setCallStatus(state === 'connected' ? 'Connected' : 'Connecting...');
      },
    });

  // Join the meeting
  useEffect(() => {
    emit('join-meeting', {
      meetingId: appointmentId,
      meetingData: {
        appointmentId,
        startTime: new Date(),
      },
    });

    // Listen for participant joined
    on<{ participant: ParticipantInfo }>('participant-joined', ({ participant }) => {
      console.log('Participant joined:', participant);
      setOtherParticipantInfo(participant);
    });

    return () => {
      off('participant-joined');
    };
  }, [appointmentId, emit, on, off]);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleToggleMute = () => {
    toggleAudio();
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoOff(!isVideoOff);
  };

  const handleEndCall = () => {
    endCall();
    setTimeout(() => {
      router.push(`/appointments/${appointmentId}`);
    }, 500);
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-white text-lg font-semibold">
            {isDoctor ? 'Patient Consultation' : 'Doctor Consultation'}
          </h1>
          <div className="text-white text-sm">
            Status: <span className={isConnected ? 'text-green-400' : 'text-yellow-400'}>{callStatus}</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Local Video */}
        <div className="relative bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-2 rounded-lg">
            <p className="text-white text-sm font-medium">{isDoctor ? 'Doctor (You)' : 'Patient (You)'}</p>
            <p className="text-gray-300 text-xs">{session?.user?.name}</p>
          </div>

          {/* Video Off Overlay */}
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-950 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-400">Camera is off</span>
              </div>
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-2 rounded-lg">
            <p className="text-white text-sm font-medium">{isDoctor ? 'Patient' : 'Doctor'}</p>
            <p className="text-gray-300 text-xs">
              {otherParticipantInfo?.name || (isDoctor ? `Patient (${patientId.slice(0, 6)}...)` : 'Doctor')}
            </p>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
                <span className="text-gray-300">Connecting...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-3">
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="lg"
            onClick={handleToggleMute}
            className="rounded-full w-14 h-14 p-0 flex items-center justify-center"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            variant={isVideoOff ? 'destructive' : 'secondary'}
            size="lg"
            onClick={handleToggleVideo}
            className="rounded-full w-14 h-14 p-0 flex items-center justify-center"
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>

          <div className="w-px h-8 bg-gray-600" />

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-14 h-14 p-0 flex items-center justify-center"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Connection State Debug */}
      <div className="bg-gray-950 border-t border-gray-700 px-4 py-2 text-center text-gray-400 text-xs">
        Connection: {connectionState}
      </div>
    </div>
  );
}
