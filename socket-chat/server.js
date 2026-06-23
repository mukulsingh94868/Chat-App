import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http'; // 1. Destructure createServer directly

const app = express();
const server = createServer(app);

// Attach socket.io to the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Serve a static client later
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // Listen for chat messages from this client
  socket.on('chat-message', (msg) => {
    // Broadcast to everyone (including sender)
    io.emit('chat-message', {
      id: socket.id,
      message: msg,
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});