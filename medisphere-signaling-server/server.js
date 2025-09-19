require("dotenv").config();
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");

const socketService = require("./src/services/socketService");
const roomController = require("./src/controllers/roomController");
const chatController = require("./src/controllers/chatController");
const logger = require("./src/utils/logger");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));

// Basic API endpoints
app.get("/health", (req, res) => res.json({ ok: true, time: Date.now() }));
app.get("/rooms/:id", roomController.getRoomInfo);
app.get("/rooms", roomController.listRooms);
app.post("/chat/save", chatController.saveMessage); // optional hook for persistence

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"]
  }
});

socketService(io, { logger });

server.listen(PORT, () => {
  logger.info(`Signaling server listening on http://localhost:${PORT}`);
});
