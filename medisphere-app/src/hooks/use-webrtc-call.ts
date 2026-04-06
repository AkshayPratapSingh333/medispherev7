// src/hooks/use-webrtc-call.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketClient } from './use-socket-client';

interface UseWebRTCCallOptions {
  meetingId: string;
  isInitiator: boolean;
  onConnectionStateChange?: (state: string) => void;
  onRemoteStreamReceived?: (stream: MediaStream) => void;
}

export function useWebRTCCall({
  meetingId,
  isInitiator,
  onConnectionStateChange,
  onRemoteStreamReceived,
}: UseWebRTCCallOptions) {
  const { emit, on, off } = useSocketClient();
  
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string>('new');
  const [isConnected, setIsConnected] = useState(false);
  const [remoteParticipantId, setRemoteParticipantId] = useState<string | null>(null);

  // Initialize local media
  const initializeLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          autoGainControl: true,
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  // Create and setup peer connection
  const createPeerConnection = useCallback(
    (localStream: MediaStream) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // Add local tracks
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        setConnectionState(peerConnection.connectionState);
        setIsConnected(peerConnection.connectionState === 'connected');
        onConnectionStateChange?.(peerConnection.connectionState);
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        const stream = event.streams[0];
        setRemoteStream(stream);
        onRemoteStreamReceived?.(stream);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          emit('webrtc:ice-candidate', {
            meetingId,
            to: remoteParticipantId,
            candidate: event.candidate,
          });
        }
      };

      return peerConnection;
    },
    [meetingId, emit, remoteParticipantId, onConnectionStateChange, onRemoteStreamReceived]
  );

  // Handle receiving offer (responder)
  const handleOffer = useCallback(
    async (offer: RTCSessionDescription, fromSocketId: string) => {
      console.log('Received offer from:', fromSocketId);
      if (!peerRef.current) return;

      try {
        setRemoteParticipantId(fromSocketId);
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);

        emit('webrtc:answer', {
          meetingId,
          to: fromSocketId,
          answer: answer,
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },
    [meetingId, emit]
  );

  // Handle receiving answer (initiator)
  const handleAnswer = useCallback(
    async (answer: RTCSessionDescription) => {
      console.log('Received answer');
      if (!peerRef.current) return;

      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    },
    []
  );

  // Handle ICE candidates
  const handleICECandidate = useCallback(async (candidate: RTCIceCandidate) => {
    if (!peerRef.current) return;

    try {
      if (candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  // Initialize WebRTC connection
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        const stream = await initializeLocalMedia();

        // Create peer connection
        const peer = createPeerConnection(stream);
        peerRef.current = peer;

        // Listen for WebRTC signals
        on<{ from: string; offer: RTCSessionDescription }>('webrtc:offer', ({ from, offer }) => {
          handleOffer(offer, from);
        });

        on<{ answer: RTCSessionDescription }>('webrtc:answer', ({ answer }) => {
          handleAnswer(answer);
        });

        on<{ candidate: RTCIceCandidate }>('webrtc:ice-candidate', ({ candidate }) => {
          handleICECandidate(candidate);
        });

        // If initiator, create and send offer
        if (isInitiator) {
          // Wait a bit for other user to connect
          setTimeout(async () => {
            try {
              const offer = await peer.createOffer();
              await peer.setLocalDescription(offer);
              emit('webrtc:offer', {
                meetingId,
                to: remoteParticipantId,
                offer: offer,
              });
            } catch (error) {
              console.error('Error creating offer:', error);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error initializing WebRTC:', error);
      }
    };

    initializeWebRTC();

    return () => {
      // Cleanup
      peerRef.current?.getSenders().forEach((sender) => sender.track?.stop());
      peerRef.current?.close();
      off('webrtc:offer');
      off('webrtc:answer');
      off('webrtc:ice-candidate');
    };
  }, [
    meetingId,
    isInitiator,
    initializeLocalMedia,
    createPeerConnection,
    handleOffer,
    handleAnswer,
    handleICECandidate,
    emit,
    on,
    off,
    remoteParticipantId,
  ]);

  // Control functions
  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  }, [localStream]);

  const endCall = useCallback(() => {
    localStream?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();
    emit('leave-meeting', { meetingId });
  }, [localStream, meetingId, emit]);

  return {
    localStream,
    remoteStream,
    connectionState,
    isConnected,
    toggleAudio,
    toggleVideo,
    endCall,
    remoteParticipantId,
  };
}
