export function setupRoomHandlers(io, socket) {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("signal", ({ roomId, data }) => {
    socket.to(roomId).emit("signal", { from: socket.id, data });
  });

  socket.on("message", ({ roomId, msg }) => {
    io.to(roomId).emit("message", { from: socket.id, msg });
  });
}
