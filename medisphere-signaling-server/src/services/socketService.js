const { jwtVerify } = require("jose");
const verifyToken = require("../middleware/verifyToken");
const logger = require("../utils/logger");

module.exports = function socketService(io, opts = {}) {
  // middleware for socket auth
  io.use(async (socket, next) => {
    try {
      // token may come in handshake.auth or handshake.query.token
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error("Unauthorized: missing token"));
      }
      const payload = await verifyToken(token);
      // attach user to socket
      socket.user = {
        id: payload.sub || payload.userId || payload.id || payload.email,
        email: payload.email,
        role: payload.role || "PATIENT"
      };
      return next();
    } catch (err) {
      logger.warn("Socket auth failed:", err?.message || err);
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id} user=${socket.user?.id}`);

    // join a room (rooms are appointment IDs or "appointment_<id>")
    socket.on("join-room", (roomId, meta = {}) => {
      logger.info(`Socket ${socket.id} join-room ${roomId}`);
      socket.join(roomId);
      // notify other participants
      socket.to(roomId).emit("user-joined", { socketId: socket.id, user: socket.user, meta });
    });

    socket.on("leave-room", (roomId) => {
      logger.info(`Socket ${socket.id} leave-room ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { socketId: socket.id, user: socket.user });
    });

    // WebRTC signaling events
    socket.on("offer", ({ roomId, offer, to }) => {
      // if 'to' specified target socket id
      if (to) {
        io.to(to).emit("offer", { from: socket.id, offer, user: socket.user });
      } else {
        socket.to(roomId).emit("offer", { from: socket.id, offer, user: socket.user });
      }
    });

    socket.on("answer", ({ roomId, answer, to }) => {
      if (to) {
        io.to(to).emit("answer", { from: socket.id, answer, user: socket.user });
      } else {
        socket.to(roomId).emit("answer", { from: socket.id, answer, user: socket.user });
      }
    });

    socket.on("ice-candidate", ({ roomId, candidate, to }) => {
      if (to) {
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
      } else {
        socket.to(roomId).emit("ice-candidate", { from: socket.id, candidate });
      }
    });

    // in-room text chat
    socket.on("chat-message", async ({ roomId, message }) => {
      const payload = { from: socket.user, socketId: socket.id, message, ts: Date.now() };
      io.to(roomId).emit("chat-message", payload);
      // optionally save to DB via HTTP endpoint
      try {
        // best-effort non-blocking persistence - fire and forget
        // you can implement internal persistence here or call external API
        // e.g. fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/chat/save`, {...})
      } catch (err) {
        logger.error("Failed to persist chat:", err);
      }
    });

    socket.on("typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("typing", { socketId: socket.id, user: socket.user, isTyping });
    });

    socket.on("end-call", ({ roomId }) => {
      socket.to(roomId).emit("end-call", { from: socket.id });
      // optionally do room cleanup
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id} reason=${reason}`);
      // broadcast leave to rooms user was in
      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      rooms.forEach(r => socket.to(r).emit("user-left", { socketId: socket.id, user: socket.user }));
    });
  });
};
