import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store connected clients
const connectedClients = new Set();

io.on("connection", (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.add(socket.id);

  // Broadcast updates to all clients except sender
  socket.on('updateCases', (cases) => {
    socket.broadcast.emit('casesUpdated', cases);
  });

  socket.on('updateTrash', (trash) => {
    socket.broadcast.emit('trashUpdated', trash);
  });

  socket.on('updateHistory', (history) => {
    socket.broadcast.emit('historyUpdated', history);
  });

  socket.on('updateTabs', (tabs) => {
    socket.broadcast.emit('tabsUpdated', tabs);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});