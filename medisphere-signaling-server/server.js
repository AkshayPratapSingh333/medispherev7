import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (_, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

function verifyJwt(token) {
  if (!NEXTAUTH_SECRET) return true; // allow all if not configured
  if (!token) return false;
  try {
    jwt.verify(token, NEXTAUTH_SECRET);
    return true;
  } catch {
    return false;
  }
}

io.on("connection", (socket) => {
  const { token } = socket.handshake.auth || {};
  if (!verifyJwt(token)) {
    socket.disconnect(true);
    return;
  }

  socket.on("join", ({ appointmentId }) => {
    if (!appointmentId) return;
    socket.join(appointmentId);
    socket.emit("joined", { appointmentId });
  });

  // Chat
  socket.on("chat:message", ({ appointmentId, message }) => {
    if (!appointmentId || !message) return;
    socket.to(appointmentId).emit("chat:message", { message });
  });

  // WebRTC relay
  socket.on("webrtc:offer", ({ appointmentId, sdp }) => {
    socket.to(appointmentId).emit("webrtc:offer", { sdp });
  });
  socket.on("webrtc:answer", ({ appointmentId, sdp }) => {
    socket.to(appointmentId).emit("webrtc:answer", { sdp });
  });
  socket.on("webrtc:ice", ({ appointmentId, candidate }) => {
    socket.to(appointmentId).emit("webrtc:ice", { candidate });
  });

  // Call state
  socket.on("call:start", ({ appointmentId }) => {
    socket.to(appointmentId).emit("call:incoming");
  });
  socket.on("call:end", ({ appointmentId }) => {
    io.to(appointmentId).emit("call:ended");
  });
});

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => console.log(`Signaling server running on ${PORT}`));
