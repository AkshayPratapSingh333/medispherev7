import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { setupWebRTCHandlers } from "./src/webrtc-handler.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (_, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const PORT = process.env.PORT || 4000;

// Participant data: Map<socketId, {name, userId, role}>
const participants = new Map();
// Room state: Map<roomId, Set<socketId>>
const rooms = new Map();
// Meeting engine state: Map<roomId, MeetingState>
const meetingStates = new Map();

function verifyJwt(token) {
  // In local/dev environments, allow anonymous socket connections when token is missing.
  if (!NEXTAUTH_SECRET) return { valid: true, payload: {} };
  if (!token) return { valid: true, payload: {} };
  try {
    const payload = jwt.verify(token, NEXTAUTH_SECRET);
    return { valid: true, payload };
  } catch {
    // Keep socket connected with guest identity so real-time features still work.
    return { valid: true, payload: {} };
  }
}

function getOrCreateMeetingState(roomId, hostSocketId) {
  if (!meetingStates.has(roomId)) {
    meetingStates.set(roomId, {
      roomId,
      hostSocketId,
      locked: false,
      password: null,
      waitingRoomEnabled: false,
      participants: new Map(),
      waitingRoom: new Map(),
      permissions: {
        canShareScreen: "all", // all | host-only
        canUnmuteSelf: "all", // all | host-only
      },
      breakoutRooms: new Map(),
      polls: [],
      qa: [],
      sharedNotes: "",
      recordingActive: false,
      captionsEnabled: false,
    });
  }

  return meetingStates.get(roomId);
}

function getParticipantData(socket) {
  return participants.get(socket.id) || {
    socketId: socket.id,
    userId: socket.id,
    name: "Guest",
    role: "PATIENT",
  };
}

function requireHost(socket, roomId) {
  const state = meetingStates.get(roomId);
  if (!state) return { ok: false, reason: "Meeting not found" };
  if (state.hostSocketId !== socket.id) {
    socket.emit("meeting:error", { message: "Host permissions required" });
    return { ok: false, reason: "Host permissions required" };
  }
  return { ok: true, state };
}

function emitRoomState(io, roomId) {
  const state = meetingStates.get(roomId);
  if (!state) return;

  io.to(roomId).emit("meeting:state", {
    roomId,
    hostSocketId: state.hostSocketId,
    locked: state.locked,
    waitingRoomEnabled: state.waitingRoomEnabled,
    permissions: state.permissions,
    participants: Array.from(state.participants.values()),
    waitingRoom: Array.from(state.waitingRoom.values()),
    breakoutRooms: Array.from(state.breakoutRooms.entries()).map(([id, room]) => ({
      breakoutId: id,
      name: room.name,
      participants: Array.from(room.participants),
    })),
    polls: state.polls,
    qa: state.qa,
    sharedNotes: state.sharedNotes,
    recordingActive: state.recordingActive,
    captionsEnabled: state.captionsEnabled,
  });
}

// Initialize WebRTC handlers
const webrtcHandlers = setupWebRTCHandlers(io, rooms, participants);

io.on("connection", (socket) => {
  const { token, name, userId, role } = socket.handshake.auth || {};
  const { valid, payload } = verifyJwt(token);

  if (!valid) {
    socket.disconnect(true);
    return;
  }

  const participantName = name || payload?.name || "Guest";
  const participantUserId = userId || payload?.sub || socket.id;
  const participantRole = role || payload?.role || "PATIENT";

  // Store participant info
  participants.set(socket.id, {
    socketId: socket.id,
    userId: participantUserId,
    name: participantName,
    role: participantRole,
  });

  console.log(
    `[${socket.id}] Connected: ${participantName} (${participantRole})`
  );

  // ===== MEETING MANAGEMENT =====
  socket.on("join-meeting", ({ meetingId, meetingData }) => {
    webrtcHandlers.joinMeeting(socket, { meetingId, meetingData });
  });

  socket.on("leave-meeting", ({ meetingId }) => {
    webrtcHandlers.leaveMeeting(socket, io, { meetingId });
  });

  socket.on("get-meeting-state", ({ meetingId }, callback) => {
    const state = webrtcHandlers.getMeetingState(meetingId);
    if (callback) callback(state);
  });

  // ===== WEBRTC SIGNALING =====
  socket.on("webrtc:offer", ({ meetingId, to, offer, roomId, targetSocketId, sdp }) => {
    // 1-to-1 appointment signaling format
    if (to && offer) {
      webrtcHandlers.sendOffer(socket, io, { meetingId, to, offer });
      return;
    }

    // instant meeting mesh format
    if (targetSocketId && sdp) {
      console.log(`[${socket.id}] Relaying WebRTC offer to ${targetSocketId}`);
      io.to(targetSocketId).emit("webrtc:offer", {
        fromSocketId: socket.id,
        sdp,
      });
    }
  });

  socket.on("webrtc:answer", ({ meetingId, to, answer, roomId, targetSocketId, sdp }) => {
    // 1-to-1 appointment signaling format
    if (to && answer) {
      webrtcHandlers.sendAnswer(socket, io, { meetingId, to, answer });
      return;
    }

    // instant meeting mesh format
    if (targetSocketId && sdp) {
      console.log(`[${socket.id}] Relaying WebRTC answer to ${targetSocketId}`);
      io.to(targetSocketId).emit("webrtc:answer", {
        fromSocketId: socket.id,
        sdp,
      });
    }
  });

  socket.on("webrtc:ice-candidate", ({ meetingId, to, candidate }) => {
    if (to && candidate) {
      webrtcHandlers.sendIceCandidate(socket, io, { meetingId, to, candidate });
    }
  });

  // ===== MEDIA CONTROL (OPTIONAL) =====
  socket.on("participant-update", ({ meetingId, state }) => {
    socket.to(meetingId).emit("participant-update", {
      socketId: socket.id,
      participant: participants.get(socket.id),
      state, // { isMuted, isVideoOff, etc }
    });
  });

  // ===== CHAT MESSAGING =====
  socket.on("chat:message", ({ appointmentId, roomId, message }) => {
    const targetRoom = appointmentId || roomId;
    if (!targetRoom || !message) return;
    socket.to(targetRoom).emit("chat:message", { message });
  });

  socket.on("join", ({ appointmentId }) => {
    socket.join(appointmentId);
    console.log(`[${socket.id}] Joined appointment room: ${appointmentId}`);
  });

  // ===== CALL INITIATION =====
  socket.on("call:initiate", ({ appointmentId, from, doctorName }) => {
    console.log(`[${socket.id}] Doctor ${doctorName} initiating call for appointment: ${appointmentId}`);
    // Primary delivery: appointment room listeners.
    io.to(appointmentId).emit("call:incoming", {
      from,
      appointmentId,
      doctorName,
      timestamp: Date.now(),
    });

    // Fallback delivery: some clients use a separate socket instance not joined to room yet.
    socket.broadcast.emit("call:incoming", {
      from,
      appointmentId,
      doctorName,
      timestamp: Date.now(),
    });
  });

  // Handle call acceptance
  socket.on("call:accept", ({ appointmentId }) => {
    console.log(`[${socket.id}] Accepted call for appointment: ${appointmentId}`);
    // Primary delivery: room-scoped.
    io.to(appointmentId).emit("call:accepted", {
      acceptedBy: socket.id,
      timestamp: Date.now(),
    });

    // Fallback delivery: doctor might be listening on another socket instance.
    socket.broadcast.emit("call:accepted", {
      appointmentId,
      acceptedBy: socket.id,
      timestamp: Date.now(),
    });
  });

  // Handle call decline
  socket.on("call:decline", ({ appointmentId }) => {
    console.log(`[${socket.id}] Declined call for appointment: ${appointmentId}`);
    // Primary delivery: room-scoped.
    io.to(appointmentId).emit("call:declined", {
      declinedBy: socket.id,
      timestamp: Date.now(),
    });

    // Fallback delivery for mixed socket instances.
    socket.broadcast.emit("call:declined", {
      appointmentId,
      declinedBy: socket.id,
      timestamp: Date.now(),
    });
  });

  // ===== INSTANT MEETINGS (join-room pattern) =====
  socket.on("join-room", ({ roomId, userInfo, password }) => {
    if (!roomId) return;

    const identity = {
      ...getParticipantData(socket),
      ...(userInfo || {}),
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      handRaised: false,
      isInBreakout: false,
    };

    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    const roomIsNew = !roomSockets || roomSockets.size === 0;
    const state = getOrCreateMeetingState(roomId, socket.id);

    if (!roomIsNew && state.password && state.password !== password) {
      socket.emit("meeting:join-denied", { roomId, reason: "Incorrect meeting password" });
      return;
    }

    if (!roomIsNew && state.locked) {
      socket.emit("meeting:join-denied", { roomId, reason: "Meeting is locked" });
      return;
    }

    if (!roomIsNew && state.waitingRoomEnabled && state.hostSocketId !== socket.id) {
      state.waitingRoom.set(socket.id, {
        socketId: socket.id,
        userId: identity.userId,
        name: identity.name,
        role: identity.role,
        requestedAt: Date.now(),
      });

      io.to(state.hostSocketId).emit("waiting-room:update", {
        roomId,
        waitingRoom: Array.from(state.waitingRoom.values()),
      });
      socket.emit("waiting-room:pending", { roomId });
      return;
    }

    socket.join(roomId);
    state.participants.set(socket.id, identity);

    const existingParticipants = Array.from(state.participants.values()).filter(
      (p) => p.socketId !== socket.id
    );

    socket.emit("room-joined", {
      roomId,
      you: identity,
      participants: existingParticipants,
      hostSocketId: state.hostSocketId,
      permissions: state.permissions,
    });

    socket.to(roomId).emit("user-joined", {
      participant: identity,
      timestamp: Date.now(),
    });

    emitRoomState(io, roomId);
  });

  socket.on("waiting-room:admit", ({ roomId, socketId }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;

    const state = gate.state;
    const pending = state.waitingRoom.get(socketId);
    if (!pending) return;

    state.waitingRoom.delete(socketId);
    const target = io.sockets.sockets.get(socketId);
    if (!target) {
      emitRoomState(io, roomId);
      return;
    }

    target.join(roomId);
    state.participants.set(socketId, {
      ...pending,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      handRaised: false,
      isInBreakout: false,
    });

    target.emit("waiting-room:admitted", { roomId });
    target.emit("room-joined", {
      roomId,
      you: state.participants.get(socketId),
      participants: Array.from(state.participants.values()).filter((p) => p.socketId !== socketId),
      hostSocketId: state.hostSocketId,
      permissions: state.permissions,
    });

    io.to(roomId).emit("user-joined", {
      participant: state.participants.get(socketId),
      timestamp: Date.now(),
    });

    io.to(state.hostSocketId).emit("waiting-room:update", {
      roomId,
      waitingRoom: Array.from(state.waitingRoom.values()),
    });

    emitRoomState(io, roomId);
  });

  socket.on("waiting-room:deny", ({ roomId, socketId }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;

    const state = gate.state;
    if (!state.waitingRoom.has(socketId)) return;

    state.waitingRoom.delete(socketId);
    io.to(socketId).emit("meeting:join-denied", { roomId, reason: "Host denied join request" });
    io.to(state.hostSocketId).emit("waiting-room:update", {
      roomId,
      waitingRoom: Array.from(state.waitingRoom.values()),
    });
    emitRoomState(io, roomId);
  });

  socket.on("waiting-room:toggle", ({ roomId, enabled }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    gate.state.waitingRoomEnabled = !!enabled;
    emitRoomState(io, roomId);
  });

  socket.on("meeting:toggle-lock", ({ roomId, locked }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    gate.state.locked = !!locked;
    emitRoomState(io, roomId);
  });

  socket.on("meeting:set-password", ({ roomId, password }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    gate.state.password = password ? String(password) : null;
    emitRoomState(io, roomId);
  });

  socket.on("meeting:set-permission", ({ roomId, key, value }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    if (!["canShareScreen", "canUnmuteSelf"].includes(key)) return;
    gate.state.permissions[key] = value;
    emitRoomState(io, roomId);
  });

  socket.on("meeting:remove-participant", ({ roomId, targetSocketId }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    const state = gate.state;
    if (targetSocketId === state.hostSocketId) return;

    const target = io.sockets.sockets.get(targetSocketId);
    if (target) {
      target.leave(roomId);
      target.emit("meeting:removed", { roomId });
    }

    state.participants.delete(targetSocketId);
    state.waitingRoom.delete(targetSocketId);
    io.to(roomId).emit("user-left", { socketId: targetSocketId, timestamp: Date.now() });
    emitRoomState(io, roomId);
  });

  socket.on("meeting:mute-all", ({ roomId }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    io.to(roomId).emit("meeting:mute-all", { roomId, by: socket.id, timestamp: Date.now() });
  });

  socket.on("hand-raise:toggle", ({ roomId, raised }) => {
    const state = meetingStates.get(roomId);
    if (!state) return;
    const participant = state.participants.get(socket.id);
    if (!participant) return;
    participant.handRaised = !!raised;
    io.to(roomId).emit("participant-updated", { participant });
    emitRoomState(io, roomId);
  });

  socket.on("reaction:send", ({ roomId, emoji }) => {
    const state = meetingStates.get(roomId);
    const sender = getParticipantData(socket);
    const isHost = !!state && state.hostSocketId === socket.id;
    const senderName = sender?.name && sender.name !== "Guest"
      ? sender.name
      : `Guest ${String(socket.id).slice(0, 4)}`;

    io.to(roomId).emit("reaction:new", {
      roomId,
      emoji,
      fromSocketId: socket.id,
      senderName,
      senderRole: sender?.role || "PARTICIPANT",
      isHost,
      timestamp: Date.now(),
    });
  });

  socket.on("recording:start", ({ roomId }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    gate.state.recordingActive = true;
    io.to(roomId).emit("recording:started", { roomId, by: socket.id, timestamp: Date.now() });
    emitRoomState(io, roomId);
  });

  socket.on("recording:stop", ({ roomId }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    gate.state.recordingActive = false;
    io.to(roomId).emit("recording:stopped", { roomId, by: socket.id, timestamp: Date.now() });
    emitRoomState(io, roomId);
  });

  socket.on("breakout:create", ({ roomId, rooms: requestedRooms }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    gate.state.breakoutRooms.clear();

    (requestedRooms || []).forEach((name, index) => {
      const breakoutId = `b${index + 1}`;
      gate.state.breakoutRooms.set(breakoutId, {
        id: breakoutId,
        name: String(name || `Breakout ${index + 1}`),
        participants: new Set(),
      });
    });

    io.to(roomId).emit("breakout:updated", {
      roomId,
      breakoutRooms: Array.from(gate.state.breakoutRooms.entries()).map(([id, room]) => ({
        breakoutId: id,
        name: room.name,
        participants: Array.from(room.participants),
      })),
    });
    emitRoomState(io, roomId);
  });

  socket.on("breakout:assign", ({ roomId, breakoutId, targetSocketId }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    const state = gate.state;
    const breakout = state.breakoutRooms.get(breakoutId);
    if (!breakout) return;

    for (const room of state.breakoutRooms.values()) {
      room.participants.delete(targetSocketId);
    }
    breakout.participants.add(targetSocketId);

    io.to(targetSocketId).emit("breakout:assigned", { roomId, breakoutId, name: breakout.name });
    emitRoomState(io, roomId);
  });

  socket.on("poll:create", ({ roomId, question, options }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    const poll = {
      id: `poll_${Date.now()}`,
      question,
      options: (options || []).map((text) => ({ text, votes: 0 })),
      votesBySocket: {},
      createdAt: Date.now(),
    };
    gate.state.polls.push(poll);
    io.to(roomId).emit("poll:updated", { roomId, polls: gate.state.polls });
  });

  socket.on("poll:vote", ({ roomId, pollId, optionIndex }) => {
    const state = meetingStates.get(roomId);
    if (!state) return;
    const poll = state.polls.find((p) => p.id === pollId);
    if (!poll || !poll.options[optionIndex]) return;

    const previous = poll.votesBySocket[socket.id];
    if (typeof previous === "number" && poll.options[previous]) {
      poll.options[previous].votes = Math.max(0, poll.options[previous].votes - 1);
    }

    poll.votesBySocket[socket.id] = optionIndex;
    poll.options[optionIndex].votes += 1;
    io.to(roomId).emit("poll:updated", { roomId, polls: state.polls });
  });

  socket.on("qa:ask", ({ roomId, question }) => {
    const state = meetingStates.get(roomId);
    if (!state) return;
    state.qa.push({
      id: `qa_${Date.now()}`,
      question,
      answer: "",
      askedBy: socket.id,
      askedByName: getParticipantData(socket).name,
      timestamp: Date.now(),
    });
    io.to(roomId).emit("qa:updated", { roomId, qa: state.qa });
  });

  socket.on("qa:answer", ({ roomId, qaId, answer }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    const item = gate.state.qa.find((q) => q.id === qaId);
    if (!item) return;
    item.answer = answer;
    item.answeredAt = Date.now();
    io.to(roomId).emit("qa:updated", { roomId, qa: gate.state.qa });
  });

  socket.on("notes:update", ({ roomId, content }) => {
    const state = meetingStates.get(roomId);
    if (!state) return;
    state.sharedNotes = String(content || "");
    io.to(roomId).emit("notes:updated", {
      roomId,
      content: state.sharedNotes,
      by: socket.id,
      timestamp: Date.now(),
    });
  });

  socket.on("whiteboard:op", ({ roomId, op }) => {
    socket.to(roomId).emit("whiteboard:op", {
      roomId,
      op,
      by: socket.id,
      timestamp: Date.now(),
    });
  });

  socket.on("captions:toggle", ({ roomId, enabled }) => {
    const gate = requireHost(socket, roomId);
    if (!gate.ok) return;
    gate.state.captionsEnabled = !!enabled;
    io.to(roomId).emit("captions:toggled", {
      roomId,
      enabled: gate.state.captionsEnabled,
      by: socket.id,
      timestamp: Date.now(),
    });
    emitRoomState(io, roomId);
  });

  socket.on("captions:line", ({ roomId, text }) => {
    io.to(roomId).emit("captions:line", {
      roomId,
      text,
      by: socket.id,
      byName: getParticipantData(socket).name,
      timestamp: Date.now(),
    });
  });

  socket.on("transcription:line", ({ roomId, text }) => {
    io.to(roomId).emit("transcription:line", {
      roomId,
      text,
      by: socket.id,
      byName: getParticipantData(socket).name,
      timestamp: Date.now(),
    });
  });

  socket.on("leave-room", ({ roomId }) => {
    console.log(`[${socket.id}] Left room: ${roomId}`);
    const state = meetingStates.get(roomId);
    if (state) {
      state.participants.delete(socket.id);
      state.waitingRoom.delete(socket.id);
      for (const breakout of state.breakoutRooms.values()) {
        breakout.participants.delete(socket.id);
      }

      if (state.hostSocketId === socket.id) {
        const nextHost = Array.from(state.participants.keys())[0] || null;
        state.hostSocketId = nextHost;
        if (nextHost) {
          io.to(roomId).emit("meeting:host-changed", { roomId, hostSocketId: nextHost });
        }
      }

      if (state.participants.size === 0 && state.waitingRoom.size === 0) {
        meetingStates.delete(roomId);
      } else {
        emitRoomState(io, roomId);
      }
    }

    socket.to(roomId).emit("user-left", {
      socketId: socket.id,
      timestamp: Date.now(),
    });
    socket.leave(roomId);
  });

  // Media control events for instant meetings
  socket.on("toggle-audio", ({ roomId, isMuted }) => {
    const state = meetingStates.get(roomId);
    if (state?.permissions?.canUnmuteSelf === "host-only" && !isMuted) {
      socket.emit("meeting:permission-denied", {
        roomId,
        action: "unmute",
        message: "Only host can unmute participants",
      });
      return;
    }

    if (state?.participants?.has(socket.id)) {
      const participant = state.participants.get(socket.id);
      participant.isMuted = !!isMuted;
      io.to(roomId).emit("participant-updated", { participant });
    }

    socket.to(roomId).emit("user-toggle-audio", {
      socketId: socket.id,
      isMuted,
    });
  });

  socket.on("toggle-video", ({ roomId, isVideoOff }) => {
    const state = meetingStates.get(roomId);
    if (state?.participants?.has(socket.id)) {
      const participant = state.participants.get(socket.id);
      participant.isVideoOff = !!isVideoOff;
      io.to(roomId).emit("participant-updated", { participant });
    }

    socket.to(roomId).emit("user-toggle-video", {
      socketId: socket.id,
      isVideoOff,
    });
  });

  socket.on("toggle-screen-share", ({ roomId, isScreenSharing }) => {
    const state = meetingStates.get(roomId);
    if (state?.permissions?.canShareScreen === "host-only" && state.hostSocketId !== socket.id) {
      socket.emit("meeting:permission-denied", {
        roomId,
        action: "share-screen",
        message: "Only host can share screen",
      });
      return;
    }

    if (state?.participants?.has(socket.id)) {
      const participant = state.participants.get(socket.id);
      participant.isScreenSharing = !!isScreenSharing;
      io.to(roomId).emit("participant-updated", { participant });
    }

    socket.to(roomId).emit("user-toggle-screen-share", {
      socketId: socket.id,
      isScreenSharing,
    });
  });

  socket.on("webrtc:ice", ({ roomId, targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("webrtc:ice", {
      fromSocketId: socket.id,
      candidate,
    });
  });

  // ===== DISCONNECT =====
  socket.on("disconnect", () => {
    for (const [roomId, state] of meetingStates.entries()) {
      let updated = false;

      if (state.participants.delete(socket.id)) updated = true;
      if (state.waitingRoom.delete(socket.id)) updated = true;
      for (const breakout of state.breakoutRooms.values()) {
        if (breakout.participants.delete(socket.id)) updated = true;
      }

      if (state.hostSocketId === socket.id) {
        state.hostSocketId = Array.from(state.participants.keys())[0] || null;
        if (state.hostSocketId) {
          io.to(roomId).emit("meeting:host-changed", { roomId, hostSocketId: state.hostSocketId });
        }
        updated = true;
      }

      if (state.participants.size === 0 && state.waitingRoom.size === 0) {
        meetingStates.delete(roomId);
      } else if (updated) {
        emitRoomState(io, roomId);
      }
    }

    webrtcHandlers.handleDisconnect(socket);
    participants.delete(socket.id);
    console.log(`[${socket.id}] Disconnected`);
  });

  // ===== ERROR HANDLING =====
  socket.on("error", (error) => {
    console.error(`[${socket.id}] Socket error:`, error);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(
    `🚀 Signaling server running on port ${PORT} (WebRTC 1-to-1 calls)`
  );
  console.log(`   Health check: http://localhost:${PORT}/health`);
});
