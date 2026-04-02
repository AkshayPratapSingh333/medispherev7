/**
 * WebRTC Signaling Handler
 * Handles offer/answer/ICE candidate relay for peer-to-peer video calls
 */

export function setupWebRTCHandlers(io, rooms, participants) {
  // Store meetings: Map<meetingId, Set<socketId>>
  const meetings = new Map();

  return {
    // Join meeting room
    joinMeeting(socket, { meetingId, meetingData }) {
      if (!meetingId) {
        socket.emit("error", { message: "Meeting ID is required" });
        return;
      }

      socket.join(meetingId);

      // Initialize meeting if doesn't exist
      if (!meetings.has(meetingId)) {
        meetings.set(meetingId, new Set());
      }

      const meeting = meetings.get(meetingId);
      meeting.add(socket.id);

      // Get other participants in meeting
      const otherSocketIds = Array.from(meeting).filter((id) => id !== socket.id);

      console.log(
        `[${socket.id}] Joined meeting ${meetingId}. Total participants: ${meeting.size}`
      );

      // Send acknowledgment with meeting info
      socket.emit("meeting-joined", {
        meetingId,
        you: participants.get(socket.id),
        others: otherSocketIds.map((id) => participants.get(id)),
      });

      // Notify others that someone joined
      socket.to(meetingId).emit("participant-joined", {
        participant: participants.get(socket.id),
      });

      // If 2 participants, notify to start WebRTC exchange
      if (meeting.size === 2) {
        const allParticipants = Array.from(meeting)
          .map((id) => ({
            socketId: id,
            ...participants.get(id),
          }));

        io.to(meetingId).emit("start-webrtc-exchange", {
          initiator: allParticipants[0],
          responder: allParticipants[1],
        });

        console.log(
          `[${meetingId}] Two participants connected. Starting WebRTC exchange.`
        );
      }
    },

    // Relay WebRTC offer (SDP)
    sendOffer(socket, io, { meetingId, to, offer }) {
      if (!to || !offer) {
        socket.emit("error", { message: "Invalid offer data" });
        return;
      }

      console.log(`[${socket.id}] Sending offer to ${to} in ${meetingId}`);

      io.to(to).emit("webrtc:offer", {
        from: socket.id,
        fromUser: participants.get(socket.id),
        offer,
        timestamp: Date.now(),
      });

      socket.emit("offer-sent", { to, timestamp: Date.now() });
    },

    // Relay WebRTC answer (SDP)
    sendAnswer(socket, io, { meetingId, to, answer }) {
      if (!to || !answer) {
        socket.emit("error", { message: "Invalid answer data" });
        return;
      }

      console.log(`[${socket.id}] Sending answer to ${to} in ${meetingId}`);

      io.to(to).emit("webrtc:answer", {
        from: socket.id,
        fromUser: participants.get(socket.id),
        answer,
        timestamp: Date.now(),
      });

      socket.emit("answer-sent", { to, timestamp: Date.now() });
    },

    // Relay ICE candidates
    sendIceCandidate(socket, io, { meetingId, to, candidate }) {
      if (!to || !candidate) {
        socket.emit("error", { message: "Invalid ICE candidate" });
        return;
      }

      io.to(to).emit("webrtc:ice-candidate", {
        from: socket.id,
        candidate,
        timestamp: Date.now(),
      });
    },

    // Leave meeting
    leaveMeeting(socket, io, { meetingId }) {
      socket.leave(meetingId);

      const meeting = meetings.get(meetingId);
      if (meeting) {
        meeting.delete(socket.id);

        if (meeting.size === 0) {
          meetings.delete(meetingId);
          console.log(`[${meetingId}] Meeting closed (empty)`);
        } else {
          // Notify remaining participants
          io.to(meetingId).emit("participant-left", {
            socketId: socket.id,
            userId: participants.get(socket.id)?.userId,
            name: participants.get(socket.id)?.name,
          });
        }
      }

      console.log(`[${socket.id}] Left meeting ${meetingId}`);
    },

    // Get meeting state
    getMeetingState(meetingId) {
      const meeting = meetings.get(meetingId);
      if (meeting) {
        return {
          meetingId,
          participants: Array.from(meeting)
            .map((id) => ({
              socketId: id,
              ...participants.get(id),
            }))
            .filter((p) => p),
          totalParticipants: meeting.size,
        };
      }
      return null;
    },

    // Clean up on disconnect
    handleDisconnect(socket) {
      // Remove from all meetings
      const participantKeys = Array.from(meetings.keys());
      participantKeys.forEach((meetingId) => {
        const meeting = meetings.get(meetingId);
        if (meeting && meeting.has(socket.id)) {
          meeting.delete(socket.id);

          // Notify others
          if (meeting.size > 0) {
            socket.to(meetingId).emit("participant-left", {
              socketId: socket.id,
              name: participants.get(socket.id)?.name,
            });
          } else {
            meetings.delete(meetingId);
          }
        }
      });
    },
  };
}
